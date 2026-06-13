package cl.duocuc.rev.incidentes.service;

import cl.duocuc.rev.incidentes.config.CorrelacionProperties;
import cl.duocuc.rev.incidentes.correlacion.CorrelacionPairOrder;
import cl.duocuc.rev.incidentes.correlacion.CorrelacionScorer;
import cl.duocuc.rev.incidentes.correlacion.GeoUtils;
import cl.duocuc.rev.incidentes.dto.ConfirmarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.CorrelacionResumenResponse;
import cl.duocuc.rev.incidentes.dto.CorrelacionResponse;
import cl.duocuc.rev.incidentes.dto.DescartarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.GrupoIncidenteResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteResumen;
import cl.duocuc.rev.incidentes.dto.VincularIncidenteRequest;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.entity.IncidenteCorrelacion;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.repository.IncidenteCorrelacionRepository;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CorrelacionService {

    private static final Set<EstadoIncidente> ESTADOS_CANDIDATO = EnumSet.of(
            EstadoIncidente.REPORTADO, EstadoIncidente.EN_PROGRESO, EstadoIncidente.ESCALADO);

    private final IncidenteRepository incidenteRepository;
    private final IncidenteCorrelacionRepository correlacionRepository;
    private final CorrelacionScorer correlacionScorer;
    private final CorrelacionProperties correlacionProperties;

    @Transactional
    public void evaluarNuevoIncidente(UUID incidenteId) {
        Incidente origen = findOrThrow(incidenteId);
        if (origen.getLat() == null || origen.getLng() == null) {
            return;
        }

        CorrelacionProperties.ReglasTipo reglas = correlacionProperties.reglasPara(origen.getTipo());
        double deltaGrados = GeoUtils.deltaGradosDesdeMetros(reglas.getRadioMetros());
        LocalDateTime desde = origen.getCreatedAt().minusMinutes(reglas.getVentanaMinutos());

        List<Incidente> candidatos = incidenteRepository.findCandidatosCorrelacion(
                origen.getId(),
                List.copyOf(ESTADOS_CANDIDATO),
                desde,
                origen.getLat() - deltaGrados,
                origen.getLat() + deltaGrados,
                origen.getLng() - deltaGrados,
                origen.getLng() + deltaGrados);

        for (Incidente candidato : candidatos) {
            procesarCandidato(origen, candidato, reglas);
        }
    }

    public List<CorrelacionResponse> listarPendientes() {
        return listarPorEstado(EstadoCorrelacion.PENDIENTE);
    }

    public List<CorrelacionResponse> listarPorEstado(EstadoCorrelacion estado) {
        return correlacionRepository.findByEstadoOrderByScoreDescCreatedAtDesc(estado).stream()
                .map(this::toResponse)
                .toList();
    }

    public CorrelacionResponse obtener(UUID correlacionId) {
        return toResponse(findCorrelacionOrThrow(correlacionId));
    }

    public List<CorrelacionResponse> listarPorIncidente(UUID incidenteId) {
        findOrThrow(incidenteId);
        return correlacionRepository.findAllByIncidenteId(incidenteId).stream()
                .map(this::toResponse)
                .toList();
    }

    public GrupoIncidenteResponse obtenerGrupo(UUID incidenteId) {
        Incidente incidente = findOrThrow(incidenteId);
        UUID canonicoId = resolveCanonicoId(incidente);
        Incidente canonico = findOrThrow(canonicoId);

        List<IncidenteResumen> vinculados = incidenteRepository.findByIncidenteCanonicoId(canonicoId).stream()
                .map(this::toResumen)
                .toList();

        List<CorrelacionResponse> pendientes = correlacionRepository
                .findByIncidenteAndEstado(canonicoId, EstadoCorrelacion.PENDIENTE)
                .stream()
                .map(this::toResponse)
                .toList();

        return GrupoIncidenteResponse.builder()
                .incidenteCanonicoId(canonicoId)
                .folioCanonico(canonico.getFolio())
                .canonico(toResumen(canonico))
                .vinculados(vinculados)
                .sugerenciasPendientes(pendientes)
                .build();
    }

    public IncidenteResumen obtenerPorFolio(String folio) {
        Incidente incidente = incidenteRepository
                .findByFolio(folio.trim().toUpperCase())
                .orElseThrow(() -> new BusinessRuleException(
                        "NOT_FOUND", "Folio no encontrado: " + folio, HttpStatus.NOT_FOUND));
        return toResumen(incidente);
    }

    public List<CorrelacionResumenResponse> resumenes(List<UUID> incidenteIds) {
        if (incidenteIds == null || incidenteIds.isEmpty()) {
            return List.of();
        }
        List<CorrelacionResumenResponse> result = new ArrayList<>();
        for (UUID id : incidenteIds) {
            result.add(resumenPara(id));
        }
        return result;
    }

    public CorrelacionResumenResponse resumenPara(UUID incidenteId) {
        Incidente incidente = findOrThrow(incidenteId);
        UUID canonicoId = resolveCanonicoId(incidente);
        Incidente canonico = findOrThrow(canonicoId);
        long vinculados = incidenteRepository.countByIncidenteCanonicoId(canonicoId);
        long pendientes = correlacionRepository.countPendientesByIncidenteId(incidenteId);
        short scoreMax = correlacionRepository.maxScorePendienteByIncidenteId(incidenteId);
        return CorrelacionResumenResponse.builder()
                .incidenteId(incidenteId)
                .incidenteCanonicoId(canonicoId)
                .folioCanonico(canonico.getFolio())
                .esCanonico(incidente.getIncidenteCanonicoId() == null && incidente.getId().equals(canonicoId))
                .cantidadReportesVinculados(vinculados)
                .sugerenciasPendientes(pendientes)
                .scoreMaximoPendiente(scoreMax)
                .build();
    }

    public UUID resolveCanonicoId(UUID incidenteId) {
        return resolveCanonicoId(findOrThrow(incidenteId));
    }

    @Transactional
    public CorrelacionResponse confirmar(UUID correlacionId, ConfirmarCorrelacionRequest request, String decididoPor) {
        if (request.getIncidenteCanonicoId() == null) {
            throw new BusinessRuleException(
                    "VALIDATION", "incidenteCanonicoId es obligatorio", HttpStatus.BAD_REQUEST);
        }
        IncidenteCorrelacion correlacion = correlacionRepository
                .findById(correlacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "NOT_FOUND", "Correlacion no encontrada", HttpStatus.NOT_FOUND));
        if (correlacion.getEstado() != EstadoCorrelacion.PENDIENTE) {
            throw new BusinessRuleException(
                    "ESTADO_INVALIDO", "La correlacion ya fue resuelta", HttpStatus.CONFLICT);
        }

        UUID canonicoId = request.getIncidenteCanonicoId();
        UUID idA = correlacion.getIncidenteAId();
        UUID idB = correlacion.getIncidenteBId();
        if (!canonicoId.equals(idA) && !canonicoId.equals(idB)) {
            throw new BusinessRuleException(
                    "VALIDATION",
                    "El incidente canonico debe ser uno de los dos reportes de la sugerencia",
                    HttpStatus.BAD_REQUEST);
        }

        vincularParACanonico(idA, idB, canonicoId);

        correlacion.setEstado(EstadoCorrelacion.CONFIRMADA);
        correlacion.setIncidenteCanonicoId(canonicoId);
        correlacion.setDecididoPor(decididoPor);
        correlacion.setDecididoAt(LocalDateTime.now());
        correlacionRepository.save(correlacion);

        return toResponse(correlacion);
    }

    @Transactional
    public CorrelacionResponse descartar(UUID correlacionId, DescartarCorrelacionRequest request, String decididoPor) {
        IncidenteCorrelacion correlacion = correlacionRepository
                .findById(correlacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "NOT_FOUND", "Correlacion no encontrada", HttpStatus.NOT_FOUND));
        if (correlacion.getEstado() != EstadoCorrelacion.PENDIENTE) {
            throw new BusinessRuleException(
                    "ESTADO_INVALIDO", "La correlacion ya fue resuelta", HttpStatus.CONFLICT);
        }
        correlacion.setEstado(EstadoCorrelacion.DESCARTADA);
        correlacion.setDecididoPor(decididoPor);
        correlacion.setDecididoAt(LocalDateTime.now());
        if (request != null && request.getMotivo() != null && !request.getMotivo().isBlank()) {
            java.util.Map<String, Object> motivo = new java.util.LinkedHashMap<>(correlacion.getMotivo());
            motivo.put("motivoDescarte", request.getMotivo().trim());
            correlacion.setMotivo(motivo);
        }
        correlacionRepository.save(correlacion);
        return toResponse(correlacion);
    }

    @Transactional
    public CorrelacionResponse revertir(UUID correlacionId, String revertidoPor) {
        IncidenteCorrelacion correlacion = findCorrelacionOrThrow(correlacionId);
        if (correlacion.getEstado() != EstadoCorrelacion.CONFIRMADA) {
            throw new BusinessRuleException(
                    "ESTADO_INVALIDO", "Solo se pueden revertir correlaciones confirmadas", HttpStatus.CONFLICT);
        }
        UUID canonicoId = correlacion.getIncidenteCanonicoId();
        if (canonicoId == null) {
            throw new BusinessRuleException(
                    "ESTADO_INVALIDO", "La correlacion confirmada no tiene incidente canonico registrado", HttpStatus.CONFLICT);
        }

        UUID idA = correlacion.getIncidenteAId();
        UUID idB = correlacion.getIncidenteBId();
        UUID vinculadoId = canonicoId.equals(idA) ? idB : idA;
        Incidente vinculado = findOrThrow(vinculadoId);
        if (canonicoId.equals(vinculado.getIncidenteCanonicoId())) {
            vinculado.setIncidenteCanonicoId(null);
            vinculado.setUpdatedAt(LocalDateTime.now());
            incidenteRepository.save(vinculado);
        }

        appendAuditoriaMotivo(correlacion, "reversiones", Map.of(
                "usuario", revertidoPor,
                "at", LocalDateTime.now().toString(),
                "canonicoAnterior", canonicoId.toString(),
                "vinculadoDesvinculado", vinculadoId.toString(),
                "confirmadoPor", correlacion.getDecididoPor() != null ? correlacion.getDecididoPor() : "",
                "confirmadoAt",
                        correlacion.getDecididoAt() != null ? correlacion.getDecididoAt().toString() : ""));

        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        correlacion.setIncidenteCanonicoId(null);
        correlacion.setDecididoPor(null);
        correlacion.setDecididoAt(null);
        correlacionRepository.save(correlacion);

        return toResponse(correlacion);
    }

    @Transactional
    public CorrelacionResponse reabrir(UUID correlacionId, String reabiertoPor) {
        IncidenteCorrelacion correlacion = findCorrelacionOrThrow(correlacionId);
        if (correlacion.getEstado() != EstadoCorrelacion.DESCARTADA) {
            throw new BusinessRuleException(
                    "ESTADO_INVALIDO", "Solo se pueden reabrir correlaciones descartadas", HttpStatus.CONFLICT);
        }

        UUID idA = correlacion.getIncidenteAId();
        UUID idB = correlacion.getIncidenteBId();
        Incidente a = findOrThrow(idA);
        Incidente b = findOrThrow(idB);
        UUID canonicoA = resolveCanonicoId(a);
        UUID canonicoB = resolveCanonicoId(b);
        if (canonicoA.equals(canonicoB)) {
            throw new BusinessRuleException(
                    "YA_VINCULADOS",
                    "Los reportes ya pertenecen al mismo grupo canonico",
                    HttpStatus.CONFLICT);
        }

        appendAuditoriaMotivo(correlacion, "reaperturas", Map.of(
                "usuario", reabiertoPor,
                "at", LocalDateTime.now().toString(),
                "descartadoPor", correlacion.getDecididoPor() != null ? correlacion.getDecididoPor() : "",
                "descartadoAt",
                        correlacion.getDecididoAt() != null ? correlacion.getDecididoAt().toString() : ""));

        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        correlacion.setDecididoPor(null);
        correlacion.setDecididoAt(null);
        correlacionRepository.save(correlacion);

        return toResponse(correlacion);
    }

    @Transactional
    public IncidenteResumen vincularManual(UUID incidenteId, VincularIncidenteRequest request, String decididoPor) {
        if (request.getIncidenteCanonicoId() == null) {
            throw new BusinessRuleException(
                    "VALIDATION", "incidenteCanonicoId es obligatorio", HttpStatus.BAD_REQUEST);
        }
        Incidente hijo = findOrThrow(incidenteId);
        Incidente canonico = findOrThrow(request.getIncidenteCanonicoId());
        if (hijo.getId().equals(canonico.getId())) {
            throw new BusinessRuleException(
                    "VALIDATION", "No puede vincular un incidente consigo mismo", HttpStatus.BAD_REQUEST);
        }
        if (canonico.getIncidenteCanonicoId() != null) {
            throw new BusinessRuleException(
                    "VALIDATION",
                    "El destino debe ser un incidente canonico (no un reporte vinculado)",
                    HttpStatus.BAD_REQUEST);
        }
        hijo.setIncidenteCanonicoId(canonico.getId());
        hijo.setUpdatedAt(LocalDateTime.now());
        incidenteRepository.save(hijo);
        return toResumen(hijo);
    }

    private void procesarCandidato(
            Incidente origen, Incidente candidato, CorrelacionProperties.ReglasTipo reglas) {
        long deltaMinutos =
                Math.abs(java.time.Duration.between(origen.getCreatedAt(), candidato.getCreatedAt()).toMinutes());
        if (deltaMinutos > reglas.getVentanaMinutos()) {
            return;
        }

        CorrelacionScorer.ResultadoPuntaje puntaje = correlacionScorer.calcular(origen, candidato);
        if (puntaje.score() < correlacionProperties.getUmbralScore()) {
            return;
        }

        CorrelacionPairOrder.OrderedPair par = CorrelacionPairOrder.ordenar(origen.getId(), candidato.getId());
        IncidenteCorrelacion existente = correlacionRepository
                .findByIncidenteAIdAndIncidenteBId(par.incidenteAId(), par.incidenteBId())
                .orElse(null);

        if (existente != null
                && (existente.getEstado() == EstadoCorrelacion.CONFIRMADA
                        || existente.getEstado() == EstadoCorrelacion.DESCARTADA)) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if (existente == null) {
            correlacionRepository.save(IncidenteCorrelacion.builder()
                    .id(UUID.randomUUID())
                    .incidenteAId(par.incidenteAId())
                    .incidenteBId(par.incidenteBId())
                    .score((short) puntaje.score())
                    .distanciaMetros(puntaje.distanciaMetros())
                    .deltaMinutos(puntaje.deltaMinutos())
                    .motivo(puntaje.motivo())
                    .estado(EstadoCorrelacion.PENDIENTE)
                    .createdAt(now)
                    .build());
        } else {
            existente.setScore((short) puntaje.score());
            existente.setDistanciaMetros(puntaje.distanciaMetros());
            existente.setDeltaMinutos(puntaje.deltaMinutos());
            existente.setMotivo(puntaje.motivo());
            existente.setEstado(EstadoCorrelacion.PENDIENTE);
            correlacionRepository.save(existente);
        }
    }

    private void vincularParACanonico(UUID idA, UUID idB, UUID canonicoId) {
        Incidente a = findOrThrow(idA);
        Incidente b = findOrThrow(idB);
        aplicarCanonico(a, canonicoId);
        aplicarCanonico(b, canonicoId);
        reasignarHijos(idA, canonicoId);
        reasignarHijos(idB, canonicoId);
    }

    private void aplicarCanonico(Incidente incidente, UUID canonicoId) {
        if (incidente.getId().equals(canonicoId)) {
            incidente.setIncidenteCanonicoId(null);
        } else {
            incidente.setIncidenteCanonicoId(canonicoId);
        }
        incidente.setUpdatedAt(LocalDateTime.now());
        incidenteRepository.save(incidente);
    }

    private void reasignarHijos(UUID antiguoCanonicoOId, UUID nuevoCanonicoId) {
        List<Incidente> hijos = incidenteRepository.findByIncidenteCanonicoId(antiguoCanonicoOId);
        for (Incidente hijo : hijos) {
            if (!hijo.getId().equals(nuevoCanonicoId)) {
                hijo.setIncidenteCanonicoId(nuevoCanonicoId);
                hijo.setUpdatedAt(LocalDateTime.now());
                incidenteRepository.save(hijo);
            }
        }
    }

    private UUID resolveCanonicoId(Incidente incidente) {
        return incidente.getIncidenteCanonicoId() != null
                ? incidente.getIncidenteCanonicoId()
                : incidente.getId();
    }

    private IncidenteCorrelacion findCorrelacionOrThrow(UUID id) {
        return correlacionRepository
                .findById(id)
                .orElseThrow(() -> new BusinessRuleException(
                        "NOT_FOUND", "Correlacion no encontrada", HttpStatus.NOT_FOUND));
    }

    private Incidente findOrThrow(UUID id) {
        return incidenteRepository
                .findById(id)
                .orElseThrow(() -> new BusinessRuleException(
                        "NOT_FOUND", "Incidente no encontrado", HttpStatus.NOT_FOUND));
    }

    @SuppressWarnings("unchecked")
    private void appendAuditoriaMotivo(IncidenteCorrelacion correlacion, String clave, Map<String, Object> entrada) {
        Map<String, Object> motivo = correlacion.getMotivo() != null
                ? new LinkedHashMap<>(correlacion.getMotivo())
                : new LinkedHashMap<>();
        List<Map<String, Object>> historial = motivo.containsKey(clave)
                ? new ArrayList<>((List<Map<String, Object>>) motivo.get(clave))
                : new ArrayList<>();
        historial.add(new LinkedHashMap<>(entrada));
        motivo.put(clave, historial);
        correlacion.setMotivo(motivo);
    }

    private CorrelacionResponse toResponse(IncidenteCorrelacion correlacion) {
        return CorrelacionResponse.builder()
                .id(correlacion.getId())
                .incidenteA(toResumen(findOrThrow(correlacion.getIncidenteAId())))
                .incidenteB(toResumen(findOrThrow(correlacion.getIncidenteBId())))
                .score(correlacion.getScore())
                .distanciaMetros(correlacion.getDistanciaMetros())
                .deltaMinutos(correlacion.getDeltaMinutos())
                .motivo(correlacion.getMotivo())
                .estado(correlacion.getEstado())
                .incidenteCanonicoId(correlacion.getIncidenteCanonicoId())
                .decididoPor(correlacion.getDecididoPor())
                .decididoAt(correlacion.getDecididoAt())
                .createdAt(correlacion.getCreatedAt())
                .build();
    }

    private IncidenteResumen toResumen(Incidente incidente) {
        return IncidenteResumen.builder()
                .id(incidente.getId())
                .folio(incidente.getFolio())
                .tipo(incidente.getTipo())
                .estado(incidente.getEstado())
                .lat(incidente.getLat())
                .lng(incidente.getLng())
                .descripcion(incidente.getDescripcion())
                .origenReporte(incidente.getOrigenReporte())
                .incidenteCanonicoId(incidente.getIncidenteCanonicoId())
                .createdAt(incidente.getCreatedAt())
                .build();
    }
}
