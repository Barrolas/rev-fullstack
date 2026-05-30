package cl.duocuc.rev.incidentes.controller;

import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.dto.IncidenteResponse;
import cl.duocuc.rev.incidentes.dto.TransicionRequest;
import cl.duocuc.rev.incidentes.service.IncidenteService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/incidentes")
@RequiredArgsConstructor
public class IncidenteController {

    private final IncidenteService incidenteService;

    @GetMapping
    public List<IncidenteResponse> listar() {
        return incidenteService.listar();
    }

    @GetMapping("/{id}")
    public IncidenteResponse obtener(@PathVariable UUID id) {
        return incidenteService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteResponse crear(@RequestBody IncidenteRequest request) {
        return incidenteService.crear(request);
    }

    @PutMapping("/{id}/transicion")
    public IncidenteResponse transicionar(@PathVariable UUID id, @RequestBody TransicionRequest request) {
        return incidenteService.transicionar(id, request.getEstadoDestino());
    }
}
