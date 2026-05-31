package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.client.ZonaRiesgoClientService;
import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.ZonaDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OperacionesFacadeService {

    private final IncidenteClientService incidenteClientService;
    private final ZonaRiesgoClientService zonaRiesgoClientService;
    private final RecursosClientService recursosClientService;

    public IncidenteDto crearIncidente(IncidenteCreateRequest request) {
        validarIncidente(request);
        return incidenteClientService.crear(request).block();
    }

    public List<ZonaDto> listarZonas() {
        List<ZonaDto> zonas = zonaRiesgoClientService.listar().block();
        return zonas != null ? zonas : List.of();
    }

    public RecursosDisponiblesDto listarRecursosDisponibles() {
        RecursosDisponiblesDto recursos = recursosClientService.listarDisponibles().block();
        return recursos != null ? recursos : RecursosDisponiblesDto.builder().build();
    }

    public AsignacionDto asignarRecurso(AsignarRecursoRequest request) {
        if (request.getIncidenteId() == null || request.getBrigadaId() == null) {
            throw new IllegalArgumentException("incidenteId y brigadaId son obligatorios");
        }
        return recursosClientService.asignar(request).block();
    }

    private void validarIncidente(IncidenteCreateRequest request) {
        if (request.getTipo() == null || request.getTipo().isBlank()) {
            throw new IllegalArgumentException("El tipo de incidente es obligatorio");
        }
        if (request.getDescripcion() == null || request.getDescripcion().isBlank()) {
            throw new IllegalArgumentException("La descripcion es obligatoria");
        }
        if (request.getLat() == null || request.getLng() == null) {
            throw new IllegalArgumentException("La ubicacion (lat/lng) es obligatoria");
        }
    }
}
