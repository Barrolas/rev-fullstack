package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.TransicionIncidenteRequest;
import cl.duocuc.rev.bff.security.RevAuthContext;
import cl.duocuc.rev.bff.service.BrigadistaFacadeService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brigadista")
@RequiredArgsConstructor
public class BrigadistaBffController {

    private final BrigadistaFacadeService brigadistaFacadeService;

    @GetMapping("/mis-asignaciones")
    public List<AsignacionActivaDto> misAsignaciones(
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        return brigadistaFacadeService.misAsignaciones(RevAuthContext.fromHeaders(sub, username, roles));
    }

    @GetMapping("/mi-brigada")
    public BrigadaDetalleDto miBrigada(
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        return brigadistaFacadeService.miBrigada(RevAuthContext.fromHeaders(sub, username, roles));
    }

    @GetMapping("/incidentes/{id}")
    public DashboardResponse incidente(
            @PathVariable UUID id,
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        return brigadistaFacadeService.incidenteAsignado(RevAuthContext.fromHeaders(sub, username, roles), id);
    }

    @PutMapping("/asignaciones/{id}/estado-despacho")
    public AsignacionActivaDto estadoDespacho(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoDespachoRequest request,
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        return brigadistaFacadeService.avanzarEstadoDespacho(
                RevAuthContext.fromHeaders(sub, username, roles), id, request);
    }

    @PutMapping("/incidentes/{id}/transicion")
    public IncidenteDto transicion(
            @PathVariable UUID id,
            @RequestBody TransicionIncidenteRequest request,
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        return brigadistaFacadeService.transicionarIncidente(
                RevAuthContext.fromHeaders(sub, username, roles), id, request);
    }
}
