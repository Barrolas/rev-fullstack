package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.bff.dto.BrigadaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadaElegibilidadDto;
import cl.duocuc.rev.bff.dto.BrigadaVehiculoDto;
import cl.duocuc.rev.bff.dto.BrigadaVehiculosRequest;
import cl.duocuc.rev.bff.dto.BrigadistaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadistaRolDto;
import cl.duocuc.rev.bff.dto.ComunaDto;
import cl.duocuc.rev.bff.dto.CompaniaDto;
import cl.duocuc.rev.bff.dto.HerramientaCreateRequest;
import cl.duocuc.rev.bff.dto.InstitucionDto;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.VehiculoCreateRequest;
import cl.duocuc.rev.bff.service.RecursosFacadeService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recursos")
@RequiredArgsConstructor
public class RecursosBffController {

    private final RecursosFacadeService recursosFacadeService;

    @GetMapping("/instituciones")
    public List<InstitucionDto> listarInstituciones() {
        return recursosFacadeService.listarInstituciones();
    }

    @GetMapping("/companias")
    public List<CompaniaDto> listarCompanias() {
        return recursosFacadeService.listarCompanias();
    }

    @GetMapping("/comunas")
    public List<ComunaDto> listarComunas() {
        return recursosFacadeService.listarComunas();
    }

    @GetMapping("/brigadista-roles")
    public List<BrigadistaRolDto> listarBrigadistaRoles() {
        return recursosFacadeService.listarBrigadistaRoles();
    }

    @GetMapping("/catalogo")
    public RecursosCatalogoDto listarCatalogo() {
        return recursosFacadeService.listarCatalogo();
    }

    @GetMapping("/disponibles")
    public RecursosDisponiblesDto listarDisponibles() {
        return recursosFacadeService.listarDisponibles();
    }

    @GetMapping("/brigadas/{id}")
    public BrigadaDetalleDto obtenerBrigada(@PathVariable Long id) {
        return recursosFacadeService.obtenerBrigada(id);
    }

    @GetMapping("/brigadas/{id}/elegibilidad-despacho")
    public BrigadaElegibilidadDto elegibilidadDespacho(@PathVariable Long id) {
        return recursosFacadeService.elegibilidadDespacho(id);
    }

    @PutMapping("/brigadas/{id}/vehiculos")
    public List<BrigadaVehiculoDto> actualizarVehiculos(
            @PathVariable Long id, @RequestBody BrigadaVehiculosRequest request) {
        return recursosFacadeService.actualizarVehiculosBrigada(id, request);
    }

    @PutMapping("/brigadas/{id}/composicion")
    public BrigadaDetalleDto actualizarComposicion(
            @PathVariable Long id, @RequestBody BrigadaComposicionRequest request) {
        return recursosFacadeService.actualizarComposicion(id, request);
    }

    @PostMapping("/brigadas")
    @ResponseStatus(HttpStatus.CREATED)
    public RecursosDisponiblesDto.BrigadaItemDto crearBrigada(@RequestBody BrigadaCreateRequest request) {
        return recursosFacadeService.crearBrigada(request);
    }

    @PostMapping("/brigadistas")
    @ResponseStatus(HttpStatus.CREATED)
    public RecursosCatalogoDto.BrigadistaItemDto crearBrigadista(@RequestBody BrigadistaCreateRequest request) {
        return recursosFacadeService.crearBrigadista(request);
    }

    @PostMapping("/vehiculos")
    @ResponseStatus(HttpStatus.CREATED)
    public RecursosDisponiblesDto.VehiculoItemDto crearVehiculo(@RequestBody VehiculoCreateRequest request) {
        return recursosFacadeService.crearVehiculo(request);
    }

    @PostMapping("/herramientas")
    @ResponseStatus(HttpStatus.CREATED)
    public RecursosDisponiblesDto.HerramientaItemDto crearHerramienta(@RequestBody HerramientaCreateRequest request) {
        return recursosFacadeService.crearHerramienta(request);
    }

    @PostMapping("/asignar")
    @ResponseStatus(HttpStatus.CREATED)
    public AsignacionDto asignar(@RequestBody AsignarRecursoRequest request) {
        return recursosFacadeService.asignarRecurso(request);
    }

    @DeleteMapping("/asignar/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desasignar(@PathVariable Long id) {
        recursosFacadeService.desasignar(id);
    }
}
