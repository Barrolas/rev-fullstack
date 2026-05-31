package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.ZonaDto;
import cl.duocuc.rev.bff.service.OperacionesFacadeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OperacionesController {

    private final OperacionesFacadeService operacionesFacadeService;

    @PostMapping("/incidentes")
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteDto crearIncidente(@RequestBody IncidenteCreateRequest request) {
        return operacionesFacadeService.crearIncidente(request);
    }

    @GetMapping("/zonas")
    public List<ZonaDto> listarZonas() {
        return operacionesFacadeService.listarZonas();
    }

    @GetMapping("/recursos/disponibles")
    public RecursosDisponiblesDto listarRecursosDisponibles() {
        return operacionesFacadeService.listarRecursosDisponibles();
    }

    @PostMapping("/recursos/asignar")
    @ResponseStatus(HttpStatus.CREATED)
    public AsignacionDto asignarRecurso(@RequestBody AsignarRecursoRequest request) {
        return operacionesFacadeService.asignarRecurso(request);
    }
}
