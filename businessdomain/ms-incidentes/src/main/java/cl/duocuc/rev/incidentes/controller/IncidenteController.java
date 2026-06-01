package cl.duocuc.rev.incidentes.controller;

import cl.duocuc.rev.incidentes.dto.AdjuntoResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.dto.IncidenteResponse;
import cl.duocuc.rev.incidentes.dto.PublicIncidenteRequest;
import cl.duocuc.rev.incidentes.dto.TransicionRequest;
import cl.duocuc.rev.incidentes.entity.IncidenteAdjunto;
import cl.duocuc.rev.incidentes.model.TipoAdjunto;
import cl.duocuc.rev.incidentes.service.AdjuntoService;
import cl.duocuc.rev.incidentes.service.AdjuntoStorageService;
import cl.duocuc.rev.incidentes.service.IncidenteService;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/incidentes")
@RequiredArgsConstructor
public class IncidenteController {

    private final IncidenteService incidenteService;
    private final AdjuntoService adjuntoService;
    private final AdjuntoStorageService adjuntoStorageService;

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

    @PostMapping("/publicos")
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteResponse crearPublico(@RequestBody PublicIncidenteRequest request) {
        return incidenteService.crearPublico(request);
    }

    @PutMapping("/{id}/transicion")
    public IncidenteResponse transicionar(@PathVariable UUID id, @RequestBody TransicionRequest request) {
        return incidenteService.transicionar(id, request.getEstadoDestino());
    }

    @GetMapping("/{id}/adjuntos")
    public List<AdjuntoResponse> listarAdjuntos(@PathVariable UUID id) {
        return adjuntoService.listar(id);
    }

    @PostMapping(value = "/{id}/adjuntos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AdjuntoResponse agregarAdjunto(
            @PathVariable UUID id,
            @RequestParam TipoAdjunto tipo,
            @RequestParam("file") MultipartFile file) throws IOException {
        return adjuntoService.agregar(id, tipo, file);
    }

    @GetMapping("/{incidenteId}/adjuntos/{adjuntoId}/archivo")
    public ResponseEntity<Resource> descargarAdjunto(
            @PathVariable UUID incidenteId, @PathVariable UUID adjuntoId) throws IOException {
        IncidenteAdjunto adjunto = adjuntoService.obtener(incidenteId, adjuntoId);
        Resource resource = new UrlResource(adjuntoStorageService.resolvePath(adjunto.getRutaStorage()).toUri());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(adjunto.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + adjunto.getNombreArchivo() + "\"")
                .body(resource);
    }
}
