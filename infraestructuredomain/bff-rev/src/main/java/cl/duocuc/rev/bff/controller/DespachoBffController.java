package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteRequest;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteResponse;
import cl.duocuc.rev.bff.dto.DespachoColaResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.service.DespachoFacadeService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/despacho")
@RequiredArgsConstructor
public class DespachoBffController {

    private final DespachoFacadeService despachoFacadeService;

    @GetMapping("/cola")
    public DespachoColaResponse cola() {
        return despachoFacadeService.obtenerCola();
    }

    @GetMapping("/activos")
    public List<AsignacionActivaDto> activos() {
        return despachoFacadeService.listarActivos();
    }

    @PostMapping("/asignar-lote")
    public DespachoAsignarLoteResponse asignarLote(@RequestBody DespachoAsignarLoteRequest request) {
        return despachoFacadeService.asignarLote(request);
    }

    @GetMapping("/incidentes/{incidenteId}/asignaciones")
    public List<AsignacionActivaDto> asignacionesIncidente(@PathVariable UUID incidenteId) {
        return despachoFacadeService.listarAsignacionesIncidente(incidenteId);
    }

    @PutMapping("/asignaciones/{id}/estado")
    public AsignacionActivaDto actualizarEstadoAsignacion(
            @PathVariable Long id, @RequestBody ActualizarEstadoDespachoRequest request) {
        return despachoFacadeService.actualizarEstadoAsignacion(id, request);
    }

    @DeleteMapping("/incidentes/{incidenteId}/asignaciones")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void liberarAsignacionesIncidente(@PathVariable UUID incidenteId) {
        despachoFacadeService.liberarAsignacionesIncidente(incidenteId);
    }

    @PostMapping("/incidentes/{incidenteId}/cerrar")
    public IncidenteDto cerrarIncidente(@PathVariable UUID incidenteId) {
        return despachoFacadeService.cerrarIncidente(incidenteId);
    }
}
