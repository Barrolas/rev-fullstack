package cl.duocuc.rev.zonas.controller;

import cl.duocuc.rev.zonas.dto.RiesgoZonaResponse;
import cl.duocuc.rev.zonas.service.ZonaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService zonaService;

    @GetMapping("/riesgo")
    public RiesgoZonaResponse consultarRiesgo(
            @RequestParam double lat,
            @RequestParam double lng) {
        return zonaService.consultarRiesgo(lat, lng);
    }
}
