package cl.duocuc.rev.incidentes.controller;

import cl.duocuc.rev.incidentes.dto.ConfirmarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.CorrelacionResumenResponse;
import cl.duocuc.rev.incidentes.dto.CorrelacionResponse;
import cl.duocuc.rev.incidentes.dto.DescartarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.GrupoIncidenteResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteResumen;
import cl.duocuc.rev.incidentes.dto.ResumenBatchRequest;
import cl.duocuc.rev.incidentes.dto.VincularIncidenteRequest;
import cl.duocuc.rev.incidentes.service.CorrelacionService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/incidentes")
@RequiredArgsConstructor
public class CorrelacionController {

    private static final String HEADER_USUARIO = "X-REV-Usuario";

    private final CorrelacionService correlacionService;

    @GetMapping("/folio/{folio}")
    public IncidenteResumen obtenerPorFolio(@PathVariable String folio) {
        return correlacionService.obtenerPorFolio(folio);
    }

    @GetMapping("/correlaciones/pendientes")
    public List<CorrelacionResponse> listarPendientes() {
        return correlacionService.listarPendientes();
    }

    @GetMapping("/correlaciones/confirmadas")
    public List<CorrelacionResponse> listarConfirmadas() {
        return correlacionService.listarPorEstado(EstadoCorrelacion.CONFIRMADA);
    }

    @GetMapping("/correlaciones/descartadas")
    public List<CorrelacionResponse> listarDescartadas() {
        return correlacionService.listarPorEstado(EstadoCorrelacion.DESCARTADA);
    }

    @GetMapping("/correlaciones")
    public List<CorrelacionResponse> listarPorEstado(
            @RequestParam(defaultValue = "PENDIENTE") EstadoCorrelacion estado) {
        return correlacionService.listarPorEstado(estado);
    }

    @GetMapping("/correlaciones/{correlacionId}")
    public CorrelacionResponse obtener(@PathVariable UUID correlacionId) {
        return correlacionService.obtener(correlacionId);
    }

    @PostMapping("/correlaciones/resumen")
    public List<CorrelacionResumenResponse> resumenes(@RequestBody ResumenBatchRequest request) {
        return correlacionService.resumenes(
                request.getIncidenteIds() != null ? request.getIncidenteIds() : List.of());
    }

    @GetMapping("/{id}/correlaciones")
    public List<CorrelacionResponse> listarPorIncidente(@PathVariable UUID id) {
        return correlacionService.listarPorIncidente(id);
    }

    @GetMapping("/{id}/grupo")
    public GrupoIncidenteResponse obtenerGrupo(@PathVariable UUID id) {
        return correlacionService.obtenerGrupo(id);
    }

    @PostMapping("/correlaciones/{correlacionId}/confirmar")
    public CorrelacionResponse confirmar(
            @PathVariable UUID correlacionId,
            @RequestBody ConfirmarCorrelacionRequest request,
            @RequestHeader(value = HEADER_USUARIO, required = false) String usuario) {
        return correlacionService.confirmar(correlacionId, request, usuarioOrDefault(usuario));
    }

    @PostMapping("/correlaciones/{correlacionId}/descartar")
    public CorrelacionResponse descartar(
            @PathVariable UUID correlacionId,
            @RequestBody(required = false) DescartarCorrelacionRequest request,
            @RequestHeader(value = HEADER_USUARIO, required = false) String usuario) {
        return correlacionService.descartar(correlacionId, request, usuarioOrDefault(usuario));
    }

    @PostMapping("/correlaciones/{correlacionId}/revertir")
    public CorrelacionResponse revertir(
            @PathVariable UUID correlacionId,
            @RequestHeader(value = HEADER_USUARIO, required = false) String usuario) {
        return correlacionService.revertir(correlacionId, usuarioOrDefault(usuario));
    }

    @PostMapping("/correlaciones/{correlacionId}/reabrir")
    public CorrelacionResponse reabrir(
            @PathVariable UUID correlacionId,
            @RequestHeader(value = HEADER_USUARIO, required = false) String usuario) {
        return correlacionService.reabrir(correlacionId, usuarioOrDefault(usuario));
    }

    @PostMapping("/{id}/vincular")
    public IncidenteResumen vincular(
            @PathVariable UUID id,
            @RequestBody VincularIncidenteRequest request,
            @RequestHeader(value = HEADER_USUARIO, required = false) String usuario) {
        return correlacionService.vincularManual(id, request, usuarioOrDefault(usuario));
    }

    private static String usuarioOrDefault(String usuario) {
        return usuario != null && !usuario.isBlank() ? usuario.trim() : "sistema";
    }
}
