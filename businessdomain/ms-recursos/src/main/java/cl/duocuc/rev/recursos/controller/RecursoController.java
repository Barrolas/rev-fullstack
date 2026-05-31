package cl.duocuc.rev.recursos.controller;

import cl.duocuc.rev.recursos.dto.AsignacionResponse;
import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.dto.HerramientaDto;
import cl.duocuc.rev.recursos.dto.HerramientaRequest;
import cl.duocuc.rev.recursos.dto.RecursoAsignadoDto;
import cl.duocuc.rev.recursos.dto.RecursosDisponiblesResponse;
import cl.duocuc.rev.recursos.dto.VehiculoDto;
import cl.duocuc.rev.recursos.dto.VehiculoRequest;
import cl.duocuc.rev.recursos.service.RecursoService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recursos")
@RequiredArgsConstructor
public class RecursoController {

    private final RecursoService recursoService;

    @GetMapping("/disponibles")
    public RecursosDisponiblesResponse listarDisponibles() {
        return recursoService.listarDisponibles();
    }

    @GetMapping("/incidente/{incidenteId}")
    public List<RecursoAsignadoDto> listarPorIncidente(@PathVariable UUID incidenteId) {
        return recursoService.listarPorIncidente(incidenteId);
    }

    @PostMapping("/asignar")
    @ResponseStatus(HttpStatus.CREATED)
    public AsignacionResponse asignar(@RequestBody AsignarRequest request) {
        return recursoService.asignar(request);
    }

    @DeleteMapping("/asignar/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desasignar(@PathVariable Long id) {
        recursoService.desasignar(id);
    }

    @PostMapping("/brigadas")
    @ResponseStatus(HttpStatus.CREATED)
    public BrigadaDto crearBrigada(@RequestBody BrigadaRequest request) {
        return recursoService.crearBrigada(request);
    }

    @PostMapping("/vehiculos")
    @ResponseStatus(HttpStatus.CREATED)
    public VehiculoDto crearVehiculo(@RequestBody VehiculoRequest request) {
        return recursoService.crearVehiculo(request);
    }

    @PostMapping("/herramientas")
    @ResponseStatus(HttpStatus.CREATED)
    public HerramientaDto crearHerramienta(@RequestBody HerramientaRequest request) {
        return recursoService.crearHerramienta(request);
    }
}
