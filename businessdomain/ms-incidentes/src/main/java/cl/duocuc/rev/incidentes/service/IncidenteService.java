package cl.duocuc.rev.incidentes.service;

import cl.duocuc.rev.incidentes.dto.AdjuntoResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.dto.IncidenteResponse;
import cl.duocuc.rev.incidentes.dto.PublicIncidenteRequest;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.entity.TransicionEstado;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import cl.duocuc.rev.incidentes.repository.TransicionEstadoRepository;
import cl.duocuc.rev.incidentes.state.IncidentStateFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IncidenteService {

    private final IncidenteRepository incidenteRepository;
    private final TransicionEstadoRepository transicionEstadoRepository;
    private final IncidentStateFactory stateFactory;
    private final FolioService folioService;
    private final AdjuntoService adjuntoService;
    private final CorrelacionService correlacionService;

    public List<IncidenteResponse> listar() {
        return incidenteRepository.findAll().stream().map(this::toResponse).toList();
    }

    public IncidenteResponse obtener(UUID id) {
        return toResponseWithAdjuntos(findOrThrow(id));
    }

    @Transactional
    public IncidenteResponse crear(IncidenteRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Incidente incidente = Incidente.builder()
                .id(UUID.randomUUID())
                .folio(folioService.nextFolio())
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .lat(request.getLat())
                .lng(request.getLng())
                .direccionReferencia(trimToNull(request.getDireccionReferencia()))
                .anonimo(false)
                .origenReporte(OrigenReporte.INTERNO)
                .estado(EstadoIncidente.REPORTADO)
                .reportanteUuid(UUID.randomUUID())
                .createdAt(now)
                .updatedAt(now)
                .build();
        Incidente guardado = incidenteRepository.save(incidente);
        correlacionService.evaluarNuevoIncidente(guardado.getId());
        return toResponse(guardado);
    }

    @Transactional
    public IncidenteResponse crearPublico(PublicIncidenteRequest request) {
        validarPublico(request);
        LocalDateTime now = LocalDateTime.now();
        UUID reportanteUuid = request.getReportanteUuid() != null ? request.getReportanteUuid() : UUID.randomUUID();

        Incidente incidente = Incidente.builder()
                .id(UUID.randomUUID())
                .folio(folioService.nextFolio())
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .lat(request.getLat())
                .lng(request.getLng())
                .direccionReferencia(trimToNull(request.getDireccionReferencia()))
                .anonimo(request.isAnonimo())
                .reportanteNombre(request.isAnonimo() ? null : trimToNull(request.getReportanteNombre()))
                .reportanteApellido(request.isAnonimo() ? null : trimToNull(request.getReportanteApellido()))
                .reportanteRut(request.isAnonimo() ? null : trimToNull(request.getReportanteRut()))
                .reportanteContacto(request.isAnonimo() ? null : trimToNull(request.getReportanteContacto()))
                .origenReporte(OrigenReporte.PUBLICO)
                .estado(EstadoIncidente.REPORTADO)
                .reportanteUuid(reportanteUuid)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Incidente guardado = incidenteRepository.save(incidente);
        correlacionService.evaluarNuevoIncidente(guardado.getId());
        return toResponse(guardado);
    }

    @Transactional
    public IncidenteResponse transicionar(UUID id, EstadoIncidente destino) {
        Incidente incidente = findOrThrow(id);
        stateFactory.validarTransicion(incidente, destino);
        EstadoIncidente anterior = incidente.getEstado();
        incidente.setEstado(destino);
        incidente.setUpdatedAt(LocalDateTime.now());
        incidenteRepository.save(incidente);
        transicionEstadoRepository.save(TransicionEstado.builder()
                .incidenteId(id)
                .estadoAnterior(anterior)
                .estadoNuevo(destino)
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse(incidente);
    }

    private void validarPublico(PublicIncidenteRequest request) {
        if (request.getTipo() == null || request.getTipo().isBlank()) {
            throw new BusinessRuleException("VALIDATION", "El tipo es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (request.getDescripcion() == null || request.getDescripcion().isBlank()) {
            throw new BusinessRuleException("VALIDATION", "La descripcion es obligatoria", HttpStatus.BAD_REQUEST);
        }
        boolean hasCoords = request.getLat() != null && request.getLng() != null;
        boolean hasAddress = request.getDireccionReferencia() != null && !request.getDireccionReferencia().isBlank();
        if (!hasCoords && !hasAddress) {
            throw new BusinessRuleException(
                    "VALIDATION", "Indique ubicacion en mapa o referencia de direccion", HttpStatus.BAD_REQUEST);
        }
    }

    private Incidente findOrThrow(UUID id) {
        return incidenteRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("NOT_FOUND", "Incidente no encontrado", HttpStatus.NOT_FOUND));
    }

    private IncidenteResponse toResponseWithAdjuntos(Incidente incidente) {
        IncidenteResponse response = toResponse(incidente);
        List<AdjuntoResponse> adjuntos = adjuntoService.listar(incidente.getId());
        response.setAdjuntos(adjuntos);
        return response;
    }

    private IncidenteResponse toResponse(Incidente incidente) {
        return IncidenteResponse.builder()
                .id(incidente.getId())
                .folio(incidente.getFolio())
                .tipo(incidente.getTipo())
                .estado(incidente.getEstado())
                .lat(incidente.getLat())
                .lng(incidente.getLng())
                .direccionReferencia(incidente.getDireccionReferencia())
                .descripcion(incidente.getDescripcion())
                .anonimo(incidente.isAnonimo())
                .reportanteNombre(incidente.getReportanteNombre())
                .reportanteApellido(incidente.getReportanteApellido())
                .reportanteRut(incidente.getReportanteRut())
                .reportanteContacto(incidente.getReportanteContacto())
                .origenReporte(incidente.getOrigenReporte())
                .reportanteUuid(incidente.getReportanteUuid())
                .createdAt(incidente.getCreatedAt())
                .updatedAt(incidente.getUpdatedAt())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
