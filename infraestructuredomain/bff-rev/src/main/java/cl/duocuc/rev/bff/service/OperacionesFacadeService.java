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
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OperacionesFacadeService {

    private final IncidenteClientService incidenteClientService;
    private final ZonaRiesgoClientService zonaRiesgoClientService;
    private final RecursosClientService recursosClientService;
    private final CorrelacionFacadeService correlacionFacadeService;

    public IncidenteDto crearIncidente(IncidenteCreateRequest request) {
        validarIncidente(request);
        return incidenteClientService.crear(request).block();
    }

    public List<ZonaDto> listarZonas(boolean incluirInactivas) {
        List<ZonaDto> zonas = zonaRiesgoClientService.listar(incluirInactivas).block();
        return zonas != null ? zonas : List.of();
    }

    public List<ZonaDto> listarZonas() {
        return listarZonas(false);
    }

    public ZonaDto crearZona(ZonaDto request) {
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la zona es obligatorio");
        }
        if (request.getCenterLat() == null || request.getCenterLng() == null || request.getRadioMetros() == null) {
            throw new IllegalArgumentException("Centro y radio en metros son obligatorios");
        }
        return zonaRiesgoClientService.crear(request).block();
    }

    public ZonaDto actualizarZona(Long id, ZonaDto request) {
        return zonaRiesgoClientService.actualizar(id, request).block();
    }

    public void desactivarZona(Long id) {
        zonaRiesgoClientService.desactivar(id).block();
    }

    public int recalcularZonasIncidentes() {
        return incidenteClientService.recalcularZonas().block();
    }

    public RecursosDisponiblesDto listarRecursosDisponibles() {
        RecursosDisponiblesDto recursos = recursosClientService.listarDisponibles().block();
        return recursos != null ? recursos : RecursosDisponiblesDto.builder().build();
    }

    public AsignacionDto asignarRecurso(AsignarRecursoRequest request) {
        if (request.getIncidenteId() == null || request.getBrigadaId() == null) {
            throw new IllegalArgumentException("incidenteId y brigadaId son obligatorios");
        }
        UUID idDespacho = correlacionFacadeService.resolverIdDespacho(request.getIncidenteId());
        request.setIncidenteId(idDespacho);
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
