package cl.duocuc.rev.recursos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.dto.BrigadistaRequest;
import cl.duocuc.rev.recursos.dto.HerramientaRequest;
import cl.duocuc.rev.recursos.dto.VehiculoRequest;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.BrigadistaRol;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRolRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RecursoServiceIntegrationTest {

    @Autowired
    private RecursoService recursoService;

    @Autowired
    private BrigadaRepository brigadaRepository;

    @Autowired
    private BrigadistaRepository brigadistaRepository;

    @Autowired
    private BrigadistaRolRepository brigadistaRolRepository;

    @Autowired
    private HerramientaRepository herramientaRepository;

    @BeforeEach
    void limpiar() {
        brigadaRepository.deleteAll();
        brigadistaRepository.deleteAll();
        brigadistaRolRepository.deleteAll();
        herramientaRepository.deleteAll();
    }

    @Test
    void crearBrigada_listarCatalogoYDisponibles() {
        BrigadaRequest request = new BrigadaRequest();
        request.setNombre("Brigada Integración");
        request.setCapacidad(6);

        var dto = recursoService.crearBrigada(request);

        assertNotNull(dto.getId());
        assertEquals("Brigada Integración", dto.getNombre());
        assertEquals(EstadoRecurso.DISPONIBLE, dto.getEstado());

        var catalogo = recursoService.listarCatalogo();
        assertEquals(1, catalogo.getBrigadas().size());

        var disponibles = recursoService.listarDisponibles();
        assertEquals(1, disponibles.getBrigadas().size());
    }

    @Test
    void crearHerramienta_apareceEnCatalogo() {
        HerramientaRequest request = new HerramientaRequest();
        request.setNombre("Kit primeros auxilios");
        request.setCantidadTotal(12);
        request.setEstado("ACTIVA");

        var dto = recursoService.crearHerramienta(request);

        assertEquals(12, dto.getCantidadTotal());
        assertFalse(recursoService.listarCatalogo().getHerramientas().isEmpty());
    }

    @Test
    void obtenerBrigadaDetalle_yElegibilidad() {
        Brigada brigada = brigadaRepository.save(Brigada.builder()
                .nombre("Solo nombre")
                .capacidad(4)
                .estado(EstadoRecurso.DISPONIBLE)
                .build());

        var detalle = recursoService.obtenerBrigadaDetalle(brigada.getId());
        assertEquals("Solo nombre", detalle.getNombre());

        var elegibilidad = recursoService.evaluarElegibilidadDespacho(brigada.getId());
        assertFalse(elegibilidad.isListaParaDespacho());
        assertTrue(elegibilidad.getMotivos().size() >= 2);
    }

    @Test
    void crearVehiculoBrigadistaYAsignarMinimo() {
        BrigadistaRol rol = brigadistaRolRepository.save(BrigadistaRol.builder()
                .codigo("JEFE")
                .nombre("Jefe")
                .jerarquia(1)
                .estado("ACTIVO")
                .build());

        BrigadaRequest brigadaReq = new BrigadaRequest();
        brigadaReq.setNombre("Brigada Delta");
        brigadaReq.setCapacidad(6);
        var brigada = recursoService.crearBrigada(brigadaReq);

        VehiculoRequest vehiculoReq = new VehiculoRequest();
        vehiculoReq.setPatente("AA-BB-11");
        vehiculoReq.setTipo("CAMIONETA");
        vehiculoReq.setCapacidadPasajeros(5);
        recursoService.crearVehiculo(vehiculoReq);

        BrigadistaRequest brigadistaReq = new BrigadistaRequest();
        brigadistaReq.setNombre("Juan");
        brigadistaReq.setApellido("Perez");
        brigadistaReq.setIdRolBrigadista(rol.getId());
        var brigadista = recursoService.crearBrigadista(brigadistaReq);

        UUID sub = UUID.randomUUID();
        recursoService.vincularKeycloakSub(brigadista.getId(), sub, "jperez", "j@test.cl");

        AsignarRequest asignar = new AsignarRequest();
        asignar.setIncidenteId(UUID.randomUUID());
        asignar.setBrigadaId(brigada.getId());
        asignar.setUsarComposicionBrigada(false);
        asignar.setDespachadoPor("integration-test");

        var asignacion = recursoService.asignar(asignar);
        assertNotNull(asignacion.getId());
        assertFalse(recursoService.listarAsignacionesActivas().isEmpty());
    }
}
