package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.AdjuntoDto;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.MapaTerritorialResponse;
import cl.duocuc.rev.bff.dto.ZonaDto;
import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.service.MapaTerritorialFacadeService;
import cl.duocuc.rev.bff.service.OperacionesFacadeService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private final MapaTerritorialFacadeService mapaTerritorialFacadeService;
    private final IncidenteClientService incidenteClientService;

    @PostMapping("/incidentes")
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteDto crearIncidente(@RequestBody IncidenteCreateRequest request) {
        return operacionesFacadeService.crearIncidente(request);
    }

    @GetMapping("/ready")
    public java.util.Map<String, String> ready() {
        return java.util.Map.of("status", "UP", "service", "bff-rev");
    }

    @GetMapping("/zonas")
    public List<ZonaDto> listarZonas() {
        return operacionesFacadeService.listarZonas();
    }

    @GetMapping("/mapa/territorial")
    public MapaTerritorialResponse mapaTerritorial() {
        return mapaTerritorialFacadeService.obtenerMapaTerritorial();
    }

    @GetMapping("/incidentes/{id}/adjuntos")
    public List<AdjuntoDto> listarAdjuntos(@PathVariable UUID id) {
        return incidenteClientService.listarAdjuntos(id).block();
    }

    @GetMapping("/incidentes/{incidenteId}/adjuntos/{adjuntoId}")
    public ResponseEntity<byte[]> descargarAdjunto(
            @PathVariable UUID incidenteId, @PathVariable UUID adjuntoId) {
        byte[] content = incidenteClientService.descargarAdjunto(incidenteId, adjuntoId).block();
        if (content == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }
}
