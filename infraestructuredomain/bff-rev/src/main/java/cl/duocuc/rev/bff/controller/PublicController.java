package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.service.OperacionesFacadeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints públicos (sin JWT) para reportes ciudadanos. */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final OperacionesFacadeService operacionesFacadeService;

    @PostMapping("/incidentes")
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteDto reportarIncidente(@RequestBody IncidenteCreateRequest request) {
        return operacionesFacadeService.crearIncidente(request);
    }
}
