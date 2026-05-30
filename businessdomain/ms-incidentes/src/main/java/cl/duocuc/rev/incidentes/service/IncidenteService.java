package cl.duocuc.rev.incidentes.service;

import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.dto.IncidenteResponse;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.entity.TransicionEstado;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
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

    public List<IncidenteResponse> listar() {
        return incidenteRepository.findAll().stream().map(this::toResponse).toList();
    }

    public IncidenteResponse obtener(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public IncidenteResponse crear(IncidenteRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Incidente incidente = Incidente.builder()
                .id(UUID.randomUUID())
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .lat(request.getLat())
                .lng(request.getLng())
                .estado(EstadoIncidente.REPORTADO)
                .reportanteUuid(UUID.randomUUID())
                .createdAt(now)
                .updatedAt(now)
                .build();
        return toResponse(incidenteRepository.save(incidente));
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

    private Incidente findOrThrow(UUID id) {
        return incidenteRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("NOT_FOUND", "Incidente no encontrado", HttpStatus.NOT_FOUND));
    }

    private IncidenteResponse toResponse(Incidente incidente) {
        return IncidenteResponse.builder()
                .id(incidente.getId())
                .tipo(incidente.getTipo())
                .estado(incidente.getEstado())
                .lat(incidente.getLat())
                .lng(incidente.getLng())
                .descripcion(incidente.getDescripcion())
                .reportanteUuid(incidente.getReportanteUuid())
                .createdAt(incidente.getCreatedAt())
                .updatedAt(incidente.getUpdatedAt())
                .build();
    }
}
