package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.bff.dto.BrigadaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadistaCreateRequest;
import cl.duocuc.rev.bff.dto.HerramientaCreateRequest;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.VehiculoCreateRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecursosFacadeService {

    private final RecursosClientService recursosClientService;
    private final CorrelacionFacadeService correlacionFacadeService;

    public RecursosCatalogoDto listarCatalogo() {
        RecursosCatalogoDto catalogo = recursosClientService.listarCatalogo().block();
        return catalogo != null ? catalogo : RecursosCatalogoDto.builder().build();
    }

    public RecursosDisponiblesDto listarDisponibles() {
        RecursosDisponiblesDto recursos = recursosClientService.listarDisponibles().block();
        return recursos != null ? recursos : RecursosDisponiblesDto.builder().build();
    }

    public BrigadaDetalleDto obtenerBrigada(Long id) {
        return recursosClientService.obtenerBrigada(id).block();
    }

    public BrigadaDetalleDto actualizarComposicion(Long id, BrigadaComposicionRequest request) {
        return recursosClientService.actualizarComposicion(id, request).block();
    }

    public RecursosDisponiblesDto.BrigadaItemDto crearBrigada(BrigadaCreateRequest request) {
        return recursosClientService.crearBrigada(request).block();
    }

    public RecursosCatalogoDto.BrigadistaItemDto crearBrigadista(BrigadistaCreateRequest request) {
        return recursosClientService.crearBrigadista(request).block();
    }

    public RecursosDisponiblesDto.VehiculoItemDto crearVehiculo(VehiculoCreateRequest request) {
        return recursosClientService.crearVehiculo(request).block();
    }

    public RecursosDisponiblesDto.HerramientaItemDto crearHerramienta(HerramientaCreateRequest request) {
        return recursosClientService.crearHerramienta(request).block();
    }

    public AsignacionDto asignarRecurso(AsignarRecursoRequest request) {
        if (request.getIncidenteId() == null || request.getBrigadaId() == null) {
            throw new IllegalArgumentException("incidenteId y brigadaId son obligatorios");
        }
        UUID idDespacho = correlacionFacadeService.resolverIdDespacho(request.getIncidenteId());
        request.setIncidenteId(idDespacho);
        return recursosClientService.asignar(request).block();
    }

    public void desasignar(Long asignacionId) {
        recursosClientService.desasignar(asignacionId).block();
    }
}
