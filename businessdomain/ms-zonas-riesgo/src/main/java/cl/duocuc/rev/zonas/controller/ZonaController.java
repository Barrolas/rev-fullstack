package cl.duocuc.rev.zonas.controller;

import cl.duocuc.rev.zonas.dto.RiesgoZonaResponse;
import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.dto.ZonaResponse;
import cl.duocuc.rev.zonas.dto.ZonaResueltaResponse;
import cl.duocuc.rev.zonas.service.ZonaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService zonaService;

    @GetMapping
    public List<ZonaResponse> listar(
            @RequestParam(defaultValue = "false") boolean incluirInactivas) {
        return zonaService.listar(incluirInactivas);
    }

    @GetMapping("/resolver")
    public ZonaResueltaResponse resolver(
            @RequestParam double lat,
            @RequestParam double lng) {
        return zonaService.resolverPunto(lat, lng);
    }

    @GetMapping("/riesgo")
    public RiesgoZonaResponse consultarRiesgo(
            @RequestParam double lat,
            @RequestParam double lng) {
        return zonaService.consultarRiesgo(lat, lng);
    }

    @GetMapping("/{id}")
    public ZonaResponse obtener(@PathVariable Long id) {
        return zonaService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ZonaResponse crear(@RequestBody ZonaRequest request) {
        return zonaService.crear(request);
    }

    @PutMapping("/{id}")
    public ZonaResponse actualizar(@PathVariable Long id, @RequestBody ZonaRequest request) {
        return zonaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        zonaService.desactivar(id);
    }
}
