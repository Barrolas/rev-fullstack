package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadaElegibilidadDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.DespachoBrigadaCardDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarItemDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteRequest;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteResponse;
import cl.duocuc.rev.bff.dto.DespachoColaItemDto;
import cl.duocuc.rev.bff.dto.DespachoColaResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class DespachoFacadeService {

    private static final Set<String> ESTADOS_COLA = Set.of("REPORTADO", "EN_PROGRESO", "ESCALADO");

    private final DashboardFacadeService dashboardFacadeService;
    private final RecursosClientService recursosClientService;
    private final IncidenteClientService incidenteClientService;

    public DespachoColaResponse obtenerCola() {
        List<DashboardResponse> dashboards;
        try {
            dashboards = dashboardFacadeService.listarDashboards();
        } catch (Exception ex) {
            log.error("No se pudo cargar dashboards para cola de despacho: {}", ex.getMessage());
            return DespachoColaResponse.builder()
                    .cola(List.of())
                    .brigadasDisponibles(List.of())
                    .recursosDegraded(true)
                    .build();
        }
        List<DespachoColaItemDto> cola = new ArrayList<>();
        boolean degraded = false;

        for (DashboardResponse dash : dashboards) {
            if (dash.isDegraded()) {
                degraded = true;
            }
            IncidenteDto inc = dash.getIncidente();
            if (inc == null || inc.getEstado() == null || !ESTADOS_COLA.contains(inc.getEstado())) {
                continue;
            }
            boolean conBrigada = dash.getRecursos() != null
                    && dash.getRecursos().stream().anyMatch(r -> "BRIGADA".equals(r.getTipo()));
            if (conBrigada) {
                continue;
            }
            cola.add(DespachoColaItemDto.builder()
                    .incidenteId(inc.getId())
                    .folio(inc.getFolio())
                    .tipo(inc.getTipo())
                    .estado(inc.getEstado())
                    .descripcion(inc.getDescripcion())
                    .lat(inc.getLat())
                    .lng(inc.getLng())
                    .zonaNombre(inc.getZonaNombre())
                    .zonaNivelRiesgo(inc.getZonaNivelRiesgo() != null
                            ? inc.getZonaNivelRiesgo()
                            : dash.getZonaRiesgo() != null ? dash.getZonaRiesgo().getNivel() : null)
                    .conBrigadaAsignada(false)
                    .prioridad(prioridad(inc.getEstado(), inc.getZonaNivelRiesgo()))
                    .createdAt(inc.getCreatedAt())
                    .build());
        }

        cola.sort(Comparator.comparingInt(DespachoColaItemDto::getPrioridad).reversed()
                .thenComparing(DespachoColaItemDto::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));

        List<DespachoBrigadaCardDto> brigadas = construirBrigadasDisponibles();
        if (brigadas.isEmpty() && !cola.isEmpty()) {
            degraded = true;
        }

        return DespachoColaResponse.builder()
                .cola(cola)
                .brigadasDisponibles(brigadas)
                .recursosDegraded(degraded)
                .build();
    }

    public List<AsignacionActivaDto> listarActivos() {
        List<AsignacionActivaDto> activas = recursosClientService.listarAsignacionesActivas().block();
        return activas != null ? activas : List.of();
    }

    public AsignacionActivaDto actualizarEstadoAsignacion(Long asignacionId, ActualizarEstadoDespachoRequest request) {
        return recursosClientService.actualizarEstadoDespacho(asignacionId, request).block();
    }

    public List<AsignacionActivaDto> listarAsignacionesIncidente(UUID incidenteId) {
        List<AsignacionActivaDto> asignaciones = recursosClientService.listarAsignacionesPorIncidente(incidenteId).block();
        return asignaciones != null ? asignaciones : List.of();
    }

    public void liberarAsignacionesIncidente(UUID incidenteId) {
        recursosClientService.liberarPorIncidente(incidenteId).block();
    }

    public IncidenteDto cerrarIncidente(UUID incidenteId) {
        IncidenteDto incidente = incidenteClientService.obtenerPorId(incidenteId).block();
        if (incidente == null) {
            throw new IllegalArgumentException("Incidente no encontrado");
        }
        recursosClientService.liberarPorIncidente(incidenteId).block();
        return transicionarHastaCerrado(incidenteId, incidente.getEstado());
    }

    public DespachoAsignarLoteResponse asignarLote(DespachoAsignarLoteRequest request) {
        if (request.getIncidenteId() == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("incidenteId e items son obligatorios");
        }
        List<DespachoAsignarLoteResponse.DespachoAsignarResultadoDto> resultados = new ArrayList<>();
        int exitosos = 0;
        int fallidos = 0;
        for (DespachoAsignarItemDto item : request.getItems()) {
            if (item.getBrigadaId() == null) {
                resultados.add(DespachoAsignarLoteResponse.DespachoAsignarResultadoDto.builder()
                        .brigadaId(null)
                        .ok(false)
                        .mensaje("brigadaId obligatorio")
                        .build());
                fallidos++;
                continue;
            }
            try {
                AsignacionDto asignacion = recursosClientService.asignar(toAsignarRequest(request, item)).block();
                resultados.add(DespachoAsignarLoteResponse.DespachoAsignarResultadoDto.builder()
                        .brigadaId(item.getBrigadaId())
                        .ok(true)
                        .asignacionId(asignacion != null ? asignacion.getId() : null)
                        .mensaje("Despachada")
                        .build());
                exitosos++;
            } catch (Exception ex) {
                log.warn("Error despachando brigada {}: {}", item.getBrigadaId(), ex.getMessage());
                resultados.add(DespachoAsignarLoteResponse.DespachoAsignarResultadoDto.builder()
                        .brigadaId(item.getBrigadaId())
                        .ok(false)
                        .mensaje(ex.getMessage() != null ? ex.getMessage() : "Error al despachar")
                        .build());
                fallidos++;
            }
        }
        return DespachoAsignarLoteResponse.builder()
                .exitosos(exitosos)
                .fallidos(fallidos)
                .resultados(resultados)
                .build();
    }

    private AsignarRecursoRequest toAsignarRequest(DespachoAsignarLoteRequest lote, DespachoAsignarItemDto item) {
        AsignarRecursoRequest req = new AsignarRecursoRequest();
        req.setIncidenteId(lote.getIncidenteId());
        req.setBrigadaId(item.getBrigadaId());
        req.setDespachadoPor(lote.getDespachadoPor());
        req.setVehiculoId(item.getVehiculoId());
        req.setPrincipalVehiculoId(item.getPrincipalVehiculoId());
        req.setVehiculoIds(item.getVehiculoIds());
        req.setBrigadistaIds(item.getBrigadistaIds());
        req.setUsarComposicionBrigada(
                item.getUsarComposicionBrigada() == null || Boolean.TRUE.equals(item.getUsarComposicionBrigada()));
        if (item.getHerramientas() != null) {
            req.setHerramientas(item.getHerramientas().stream()
                    .map(h -> {
                        var dto = new DespachoAsignarItemDto.HerramientaCantidadDto();
                        dto.setHerramientaId(h.getHerramientaId());
                        dto.setCantidad(h.getCantidad());
                        return dto;
                    })
                    .toList());
        }
        return req;
    }

    private List<DespachoBrigadaCardDto> construirBrigadasDisponibles() {
        try {
            RecursosDisponiblesDto disponibles = recursosClientService.listarDisponibles().block();
            if (disponibles == null || disponibles.getBrigadas() == null) {
                return List.of();
            }
            List<DespachoBrigadaCardDto> cards = new ArrayList<>();
            for (RecursosDisponiblesDto.BrigadaItemDto b : disponibles.getBrigadas()) {
                cards.add(construirCardBrigada(b));
            }
            return cards;
        } catch (WebClientResponseException ex) {
            log.warn("MS-RECURSOS no disponible para brigadas despacho: {} {}", ex.getStatusCode(), ex.getMessage());
            return List.of();
        } catch (Exception ex) {
            log.warn("Error cargando brigadas para despacho: {}", ex.getMessage());
            return List.of();
        }
    }

    private DespachoBrigadaCardDto construirCardBrigada(RecursosDisponiblesDto.BrigadaItemDto b) {
        var elegibilidad = cargarElegibilidad(b.getId());
        var detalle = cargarDetalleBrigada(b.getId());
        return DespachoBrigadaCardDto.builder()
                .id(b.getId())
                .nombre(b.getNombre())
                .estado(b.getEstado())
                .listaParaDespacho(elegibilidad != null && elegibilidad.isListaParaDespacho())
                .elegibilidad(elegibilidad)
                .detalle(detalle)
                .build();
    }

    private BrigadaElegibilidadDto cargarElegibilidad(Long brigadaId) {
        try {
            return recursosClientService.elegibilidadDespacho(brigadaId).block();
        } catch (Exception ex) {
            log.debug("Elegibilidad brigada {} no disponible: {}", brigadaId, ex.getMessage());
            return null;
        }
    }

    private BrigadaDetalleDto cargarDetalleBrigada(Long brigadaId) {
        try {
            return recursosClientService.obtenerBrigada(brigadaId).block();
        } catch (Exception ex) {
            log.debug("Detalle brigada {} no disponible: {}", brigadaId, ex.getMessage());
            return null;
        }
    }

    private IncidenteDto transicionarHastaCerrado(UUID incidenteId, String estadoActual) {
        String estado = estadoActual != null ? estadoActual : "";
        if ("CERRADO".equals(estado)) {
            return incidenteClientService.obtenerPorId(incidenteId).block();
        }
        if ("REPORTADO".equals(estado)) {
            incidenteClientService.transicionar(incidenteId, "EN_PROGRESO").block();
            estado = "EN_PROGRESO";
        }
        if ("EN_PROGRESO".equals(estado) || "ESCALADO".equals(estado)) {
            incidenteClientService.transicionar(incidenteId, "CONTROLADO").block();
            estado = "CONTROLADO";
        }
        if ("CONTROLADO".equals(estado)) {
            return incidenteClientService.transicionar(incidenteId, "CERRADO").block();
        }
        throw new IllegalStateException("No se puede cerrar incidente en estado " + estado);
    }

    private int prioridad(String estado, String nivelRiesgo) {
        int p = 0;
        if ("ESCALADO".equals(estado)) {
            p += 30;
        } else if ("EN_PROGRESO".equals(estado)) {
            p += 20;
        } else if ("REPORTADO".equals(estado)) {
            p += 10;
        }
        if ("HIGH".equalsIgnoreCase(nivelRiesgo)) {
            p += 15;
        } else if ("MEDIUM".equalsIgnoreCase(nivelRiesgo)) {
            p += 8;
        }
        return p;
    }
}
