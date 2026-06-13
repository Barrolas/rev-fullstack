package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.CorrelacionClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.ConfirmarCorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionResumenDto;
import cl.duocuc.rev.bff.dto.DescartarCorrelacionDto;
import cl.duocuc.rev.bff.dto.GrupoIncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteResumenDto;
import cl.duocuc.rev.bff.dto.RevertirCorrelacionPreviewDto;
import cl.duocuc.rev.bff.dto.RevertirCorrelacionRequest;
import cl.duocuc.rev.bff.dto.TransferirIncidenteRequest;
import cl.duocuc.rev.bff.exception.CorrelacionBloqueadaException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CorrelacionFacadeService {

    private static final String ESTADO_CONFIRMADA = "CONFIRMADA";

    private final CorrelacionClientService correlacionClientService;
    private final RecursosClientService recursosClientService;

    public List<CorrelacionDto> listarPendientes() {
        return listarPorEstado("PENDIENTE");
    }

    public List<CorrelacionDto> listarPorEstado(String estado) {
        List<CorrelacionDto> list = correlacionClientService.listarPorEstado(estado).block();
        return list != null ? list : List.of();
    }

    public long contarPendientes() {
        return listarPendientes().size();
    }

    public GrupoIncidenteDto obtenerGrupo(UUID incidenteId) {
        return correlacionClientService.obtenerGrupo(incidenteId).block();
    }

    public List<CorrelacionDto> listarPorIncidente(UUID incidenteId) {
        List<CorrelacionDto> list = correlacionClientService.listarPorIncidente(incidenteId).block();
        return list != null ? list : List.of();
    }

    public IncidenteResumenDto obtenerPorFolio(String folio) {
        return correlacionClientService.obtenerPorFolio(folio).block();
    }

    public CorrelacionDto confirmar(UUID correlacionId, ConfirmarCorrelacionDto request, String usuario) {
        return correlacionClientService.confirmar(correlacionId, request, usuario).block();
    }

    public CorrelacionDto descartar(UUID correlacionId, DescartarCorrelacionDto request, String usuario) {
        return correlacionClientService.descartar(correlacionId, request, usuario).block();
    }

    public CorrelacionDto revertir(UUID correlacionId, RevertirCorrelacionRequest request, String usuario) {
        RevertirCorrelacionPreviewDto preview = previewRevertir(correlacionId);
        if (preview.isBloqueado()) {
            UUID destino = request != null ? request.getReasignarAsignacionesA() : null;
            if (destino == null) {
                throw new CorrelacionBloqueadaException(
                        "Hay brigadas activas en el incidente canonico. Reasigne recursos antes de deshacer.",
                        preview.getAsignacionesActivas());
            }
            if (!destino.equals(preview.getIncidenteDestinoSugerido())) {
                throw new IllegalArgumentException(
                        "El destino de reasignacion debe ser el reporte que quedara independiente");
            }
            TransferirIncidenteRequest transfer = new TransferirIncidenteRequest();
            transfer.setNuevoIncidenteId(destino);
            transfer.setAsignacionIds(preview.getAsignacionesActivas().stream()
                    .map(AsignacionActivaDto::getId)
                    .filter(Objects::nonNull)
                    .toList());
            recursosClientService.transferirIncidente(transfer).block();
        }
        return correlacionClientService.revertir(correlacionId, usuario).block();
    }

    public RevertirCorrelacionPreviewDto previewRevertir(UUID correlacionId) {
        CorrelacionDto correlacion = correlacionClientService.obtener(correlacionId).block();
        if (correlacion == null) {
            throw new IllegalArgumentException("Correlacion no encontrada");
        }
        if (!ESTADO_CONFIRMADA.equals(correlacion.getEstado())) {
            throw new IllegalArgumentException("Solo se puede deshacer una correlacion confirmada");
        }
        UUID canonicoId = correlacion.getIncidenteCanonicoId();
        if (canonicoId == null) {
            throw new IllegalArgumentException("La correlacion no tiene incidente canonico registrado");
        }

        IncidenteResumenDto canonico = canonicoId.equals(correlacion.getIncidenteA().getId())
                ? correlacion.getIncidenteA()
                : correlacion.getIncidenteB();
        UUID vinculadoId = canonicoId.equals(correlacion.getIncidenteA().getId())
                ? correlacion.getIncidenteB().getId()
                : correlacion.getIncidenteA().getId();
        IncidenteResumenDto reporteDesvinculado = canonicoId.equals(correlacion.getIncidenteA().getId())
                ? correlacion.getIncidenteB()
                : correlacion.getIncidenteA();

        List<AsignacionActivaDto> asignaciones = recursosClientService
                .listarAsignacionesPorIncidente(canonicoId)
                .block();
        List<AsignacionActivaDto> activas = asignaciones != null ? asignaciones : List.of();

        return RevertirCorrelacionPreviewDto.builder()
                .correlacion(correlacion)
                .canonico(canonico)
                .reporteDesvinculado(reporteDesvinculado)
                .incidenteDestinoSugerido(vinculadoId)
                .bloqueado(!activas.isEmpty())
                .asignacionesActivas(activas)
                .build();
    }

    public CorrelacionDto reabrir(UUID correlacionId, String usuario) {
        return correlacionClientService.reabrir(correlacionId, usuario).block();
    }

    public void enriquecerIncidente(IncidenteDto incidente, Map<UUID, CorrelacionResumenDto> resumenes) {
        if (incidente == null || incidente.getId() == null) {
            return;
        }
        CorrelacionResumenDto resumen = resumenes.get(incidente.getId());
        if (resumen == null) {
            return;
        }
        incidente.setIncidenteCanonicoId(resumen.getIncidenteCanonicoId());
        incidente.setFolioCanonico(resumen.getFolioCanonico());
        incidente.setEsCanonico(resumen.isEsCanonico());
        incidente.setCantidadReportesVinculados(resumen.getCantidadReportesVinculados());
        incidente.setSugerenciasPendientes(resumen.getSugerenciasPendientes());
        incidente.setScoreMaximoPendiente(resumen.getScoreMaximoPendiente());
    }

    public Map<UUID, CorrelacionResumenDto> cargarResumenes(List<UUID> incidenteIds) {
        if (incidenteIds == null || incidenteIds.isEmpty()) {
            return Map.of();
        }
        List<CorrelacionResumenDto> resumenes = correlacionClientService.resumenes(incidenteIds).block();
        if (resumenes == null) {
            return Map.of();
        }
        return resumenes.stream()
                .collect(Collectors.toMap(CorrelacionResumenDto::getIncidenteId, Function.identity(), (a, b) -> a));
    }

    public UUID resolverIdDespacho(UUID incidenteId) {
        CorrelacionResumenDto resumen = correlacionClientService.resumen(incidenteId).block();
        if (resumen == null || resumen.getIncidenteCanonicoId() == null) {
            return incidenteId;
        }
        return resumen.getIncidenteCanonicoId();
    }
}
