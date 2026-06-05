package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteRequest;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteResponse;
import cl.duocuc.rev.bff.dto.DespachoColaResponse;
import cl.duocuc.rev.bff.service.DespachoFacadeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
}
