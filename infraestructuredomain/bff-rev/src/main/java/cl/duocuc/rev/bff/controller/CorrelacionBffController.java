package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.ConfirmarCorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionDto;
import cl.duocuc.rev.bff.dto.DescartarCorrelacionDto;
import cl.duocuc.rev.bff.dto.GrupoIncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteResumenDto;
import cl.duocuc.rev.bff.dto.RevertirCorrelacionPreviewDto;
import cl.duocuc.rev.bff.dto.RevertirCorrelacionRequest;
import cl.duocuc.rev.bff.service.CorrelacionFacadeService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidentes")
@RequiredArgsConstructor
public class CorrelacionBffController {

    private final CorrelacionFacadeService correlacionFacadeService;

    @GetMapping("/correlaciones/pendientes")
    public List<CorrelacionDto> listarPendientes() {
        return correlacionFacadeService.listarPendientes();
    }

    @GetMapping("/correlaciones/confirmadas")
    public List<CorrelacionDto> listarConfirmadas() {
        return correlacionFacadeService.listarPorEstado("CONFIRMADA");
    }

    @GetMapping("/correlaciones/descartadas")
    public List<CorrelacionDto> listarDescartadas() {
        return correlacionFacadeService.listarPorEstado("DESCARTADA");
    }

    @GetMapping("/correlaciones")
    public List<CorrelacionDto> listarPorEstado(
            @RequestParam(defaultValue = "PENDIENTE") String estado) {
        return correlacionFacadeService.listarPorEstado(estado);
    }

    @GetMapping("/correlaciones/pendientes/count")
    public Map<String, Long> contarPendientes() {
        return Map.of("total", correlacionFacadeService.contarPendientes());
    }

    @GetMapping("/folio/{folio}")
    public IncidenteResumenDto obtenerPorFolio(@PathVariable String folio) {
        return correlacionFacadeService.obtenerPorFolio(folio);
    }

    @GetMapping("/{id}/grupo")
    public GrupoIncidenteDto obtenerGrupo(@PathVariable UUID id) {
        return correlacionFacadeService.obtenerGrupo(id);
    }

    @GetMapping("/{id}/correlaciones")
    public List<CorrelacionDto> listarPorIncidente(@PathVariable UUID id) {
        return correlacionFacadeService.listarPorIncidente(id);
    }

    @PostMapping("/correlaciones/{correlacionId}/confirmar")
    public CorrelacionDto confirmar(
            @PathVariable UUID correlacionId,
            @RequestBody ConfirmarCorrelacionDto request,
            @RequestHeader(value = "X-REV-Usuario", required = false) String usuario) {
        return correlacionFacadeService.confirmar(correlacionId, request, usuario);
    }

    @PostMapping("/correlaciones/{correlacionId}/descartar")
    public CorrelacionDto descartar(
            @PathVariable UUID correlacionId,
            @RequestBody(required = false) DescartarCorrelacionDto request,
            @RequestHeader(value = "X-REV-Usuario", required = false) String usuario) {
        return correlacionFacadeService.descartar(correlacionId, request, usuario);
    }

    @GetMapping("/correlaciones/{correlacionId}/revertir/preview")
    public RevertirCorrelacionPreviewDto previewRevertir(@PathVariable UUID correlacionId) {
        return correlacionFacadeService.previewRevertir(correlacionId);
    }

    @PostMapping("/correlaciones/{correlacionId}/revertir")
    public CorrelacionDto revertir(
            @PathVariable UUID correlacionId,
            @RequestBody(required = false) RevertirCorrelacionRequest request,
            @RequestHeader(value = "X-REV-Usuario", required = false) String usuario) {
        return correlacionFacadeService.revertir(correlacionId, request, usuario);
    }

    @PostMapping("/correlaciones/{correlacionId}/reabrir")
    public CorrelacionDto reabrir(
            @PathVariable UUID correlacionId,
            @RequestHeader(value = "X-REV-Usuario", required = false) String usuario) {
        return correlacionFacadeService.reabrir(correlacionId, usuario);
    }
}
