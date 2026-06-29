package cl.duocuc.rev.recursos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.recursos.dto.BrigadistaDto;
import cl.duocuc.rev.recursos.dto.BrigadistaRequest;
import cl.duocuc.rev.recursos.dto.VehiculoRequest;
import cl.duocuc.rev.recursos.entity.Asignacion;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.BrigadaBrigadista;
import cl.duocuc.rev.recursos.entity.BrigadaHerramienta;
import cl.duocuc.rev.recursos.entity.BrigadaVehiculo;
import cl.duocuc.rev.recursos.entity.Brigadista;
import cl.duocuc.rev.recursos.entity.BrigadistaRol;
import cl.duocuc.rev.recursos.entity.Comuna;
import cl.duocuc.rev.recursos.entity.Compania;
import cl.duocuc.rev.recursos.entity.Herramienta;
import cl.duocuc.rev.recursos.entity.Institucion;
import cl.duocuc.rev.recursos.entity.Vehiculo;
import cl.duocuc.rev.recursos.exception.BusinessRuleException;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.AsignacionBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionHerramientaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionRepository;
import cl.duocuc.rev.recursos.repository.BrigadaBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaHerramientaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaVehiculoRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRolRepository;
import cl.duocuc.rev.recursos.repository.ComunaRepository;
import cl.duocuc.rev.recursos.repository.CompaniaRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import cl.duocuc.rev.recursos.repository.InstitucionRepository;
import cl.duocuc.rev.recursos.repository.VehiculoRepository;
import cl.duocuc.rev.recursos.service.RecursoService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RecursoServiceListadosTest {

    @Mock
    private BrigadaRepository brigadaRepository;

    @Mock
    private VehiculoRepository vehiculoRepository;

    @Mock
    private HerramientaRepository herramientaRepository;

    @Mock
    private BrigadistaRepository brigadistaRepository;

    @Mock
    private AsignacionRepository asignacionRepository;

    @Mock
    private BrigadaHerramientaRepository brigadaHerramientaRepository;

    @Mock
    private AsignacionBrigadistaRepository asignacionBrigadistaRepository;

    @Mock
    private AsignacionHerramientaRepository asignacionHerramientaRepository;

    @Mock
    private InstitucionRepository institucionRepository;

    @Mock
    private CompaniaRepository companiaRepository;

    @Mock
    private ComunaRepository comunaRepository;

    @Mock
    private BrigadistaRolRepository brigadistaRolRepository;

    @Mock
    private BrigadaVehiculoRepository brigadaVehiculoRepository;

    @Mock
    private BrigadaBrigadistaRepository brigadaBrigadistaRepository;

    @InjectMocks
    private RecursoService recursoService;

    private static final Long BRIGADA_ID = 1L;
    private static final Long JEFE_ID = 10L;
    private static final Long COMBATIENTE_ID = 11L;
    private static final Long VEHICULO_ID = 20L;
    private static final Long HERRAMIENTA_ID = 30L;
    private static final Long ROL_JEFE_ID = 1L;
    private static final Long ROL_COMBATIENTE_ID = 2L;

    @Test
    void listarInstituciones_retornaDto() {
        Institucion institucion = Institucion.builder()
                .id(1L)
                .codigo("CBV")
                .nombre("Cuerpo de Bomberos")
                .estado("ACTIVA")
                .build();
        when(institucionRepository.findAll()).thenReturn(List.of(institucion));

        var resultado = recursoService.listarInstituciones();

        assertEquals(1, resultado.size());
        assertEquals("CBV", resultado.getFirst().getCodigo());
        assertEquals("Cuerpo de Bomberos", resultado.getFirst().getNombre());
    }

    @Test
    void listarCompanias_incluyeNombreComuna() {
        Compania compania = Compania.builder()
                .id(5L)
                .idInstitucion(1L)
                .idComuna(13101)
                .codigo("C1")
                .nombre("Primera Compañía")
                .estado("ACTIVA")
                .build();
        Comuna comuna = Comuna.builder()
                .codigoCasen(13101)
                .codigoProvinciaCasen(131)
                .nombre("Santiago")
                .estado("ACTIVA")
                .build();
        when(companiaRepository.findAll()).thenReturn(List.of(compania));
        when(comunaRepository.findById(13101)).thenReturn(Optional.of(comuna));

        var resultado = recursoService.listarCompanias();

        assertEquals(1, resultado.size());
        assertEquals("Santiago", resultado.getFirst().getNombreComuna());
        assertEquals("Primera Compañía", resultado.getFirst().getNombre());
    }

    @Test
    void listarComunas_retornaDto() {
        Comuna comuna = Comuna.builder()
                .codigoCasen(13101)
                .codigoProvinciaCasen(131)
                .nombre("Santiago")
                .estado("ACTIVA")
                .build();
        when(comunaRepository.findAll()).thenReturn(List.of(comuna));

        var resultado = recursoService.listarComunas();

        assertEquals(1, resultado.size());
        assertEquals(13101, resultado.getFirst().getCodigoCasen());
        assertEquals("Santiago", resultado.getFirst().getNombre());
    }

    @Test
    void listarBrigadistaRoles_retornaDto() {
        BrigadistaRol rol = BrigadistaRol.builder()
                .id(1L)
                .codigo("JEFE")
                .nombre("Jefe de brigada")
                .jerarquia(1)
                .estado("ACTIVO")
                .build();
        when(brigadistaRolRepository.findAll()).thenReturn(List.of(rol));

        var resultado = recursoService.listarBrigadistaRoles();

        assertEquals(1, resultado.size());
        assertEquals("JEFE", resultado.getFirst().getCodigo());
        assertEquals(1, resultado.getFirst().getJerarquia());
        assertEquals("ACTIVO", resultado.getFirst().getEstado());
    }

    @Test
    void listarCatalogo_agregaTodosLosRecursos() {
        Brigada brigada = Brigada.builder()
                .id(BRIGADA_ID)
                .nombre("Alpha")
                .capacidad(6)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        Vehiculo vehiculo = Vehiculo.builder()
                .id(VEHICULO_ID)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(1000)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        Herramienta herramienta = Herramienta.builder()
                .id(HERRAMIENTA_ID)
                .nombre("Manguera")
                .cantidadTotal(5)
                .cantidadDisponible(5)
                .estado("ACTIVA")
                .build();
        Brigadista brigadista = Brigadista.builder()
                .id(JEFE_ID)
                .nombre("Ana")
                .apellido("López")
                .estado(EstadoRecurso.DISPONIBLE)
                .build();

        when(brigadaRepository.findAll()).thenReturn(List.of(brigada));
        when(vehiculoRepository.findAll()).thenReturn(List.of(vehiculo));
        when(herramientaRepository.findAll()).thenReturn(List.of(herramienta));
        when(brigadistaRepository.findAll()).thenReturn(List.of(brigadista));
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(BRIGADA_ID)).thenReturn(List.of());

        var catalogo = recursoService.listarCatalogo();

        assertEquals(1, catalogo.getBrigadas().size());
        assertEquals(1, catalogo.getVehiculos().size());
        assertEquals(1, catalogo.getHerramientas().size());
        assertEquals(1, catalogo.getBrigadistas().size());
        assertEquals("Alpha", catalogo.getBrigadas().getFirst().getNombre());
    }

    @Test
    void listarDisponibles_filtraPorEstado() {
        Brigada brigada = Brigada.builder()
                .id(BRIGADA_ID)
                .nombre("Alpha")
                .capacidad(6)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        Vehiculo vehiculo = Vehiculo.builder()
                .id(VEHICULO_ID)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(1000)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        Herramienta herramienta = Herramienta.builder()
                .id(HERRAMIENTA_ID)
                .nombre("Manguera")
                .cantidadTotal(5)
                .cantidadDisponible(3)
                .estado("ACTIVA")
                .build();

        when(brigadaRepository.findByEstado(EstadoRecurso.DISPONIBLE)).thenReturn(List.of(brigada));
        when(vehiculoRepository.findByEstado(EstadoRecurso.DISPONIBLE)).thenReturn(List.of(vehiculo));
        when(herramientaRepository.findByCantidadDisponibleGreaterThan(0)).thenReturn(List.of(herramienta));
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(BRIGADA_ID)).thenReturn(List.of());

        var disponibles = recursoService.listarDisponibles();

        assertEquals(1, disponibles.getBrigadas().size());
        assertEquals(1, disponibles.getVehiculos().size());
        assertEquals(1, disponibles.getHerramientas().size());
    }

    @Test
    void obtenerBrigadaDetalle_brigadaCompleta() {
        mockBrigadaCompleta(EstadoRecurso.DISPONIBLE);

        var detalle = recursoService.obtenerBrigadaDetalle(BRIGADA_ID);

        assertEquals(BRIGADA_ID, detalle.getId());
        assertEquals("Brigada Alpha", detalle.getNombre());
        assertTrue(detalle.isListaParaDespacho());
        assertNotNull(detalle.getJefe());
        assertEquals(2, detalle.getBrigadistas().size());
        assertEquals(1, detalle.getHerramientas().size());
    }

    @Test
    void obtenerBrigadaDetalle_noEncontrada_lanzaExcepcion() {
        when(brigadaRepository.findById(99L)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class, () -> recursoService.obtenerBrigadaDetalle(99L));
        assertEquals("BRIGADA_NO_ENCONTRADA", ex.getCode());
    }

    @Test
    void evaluarElegibilidadDespacho_brigadaLista_esElegible() {
        mockBrigadaCompleta(EstadoRecurso.DISPONIBLE);

        var elegibilidad = recursoService.evaluarElegibilidadDespacho(BRIGADA_ID);

        assertTrue(elegibilidad.isListaParaDespacho());
        assertTrue(elegibilidad.getMotivos().isEmpty());
        assertEquals(2, elegibilidad.getIntegrantes());
        assertEquals(6, elegibilidad.getCapacidadBrigada());
        assertEquals(8, elegibilidad.getCapacidadPasajerosVehiculoPrincipal());
    }

    @Test
    void evaluarElegibilidadDespacho_sinJefe_noEsElegible() {
        Brigada brigada = Brigada.builder()
                .id(BRIGADA_ID)
                .nombre("Brigada Alpha")
                .capacidad(6)
                .estado(EstadoRecurso.DISPONIBLE)
                .idJefeBrigadista(null)
                .build();
        when(brigadaRepository.findById(BRIGADA_ID)).thenReturn(Optional.of(brigada));
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(BRIGADA_ID)).thenReturn(List.of());
        when(brigadaBrigadistaRepository.findByBrigadaIdAndActivaTrue(BRIGADA_ID)).thenReturn(List.of());
        when(brigadaHerramientaRepository.findByBrigadaId(BRIGADA_ID)).thenReturn(List.of());

        var elegibilidad = recursoService.evaluarElegibilidadDespacho(BRIGADA_ID);

        assertFalse(elegibilidad.isListaParaDespacho());
        assertTrue(elegibilidad.getMotivos().stream().anyMatch(m -> m.contains("jefe")));
        assertTrue(elegibilidad.getMotivos().stream().anyMatch(m -> m.contains("integrantes")));
        assertTrue(elegibilidad.getMotivos().stream().anyMatch(m -> m.contains("vehículo")));
    }

    @Test
    void evaluarElegibilidadDespacho_brigadaAsignada_noEsElegible() {
        mockBrigadaCompleta(EstadoRecurso.ASIGNADO);

        var elegibilidad = recursoService.evaluarElegibilidadDespacho(BRIGADA_ID);

        assertFalse(elegibilidad.isListaParaDespacho());
        assertTrue(elegibilidad.getMotivos().stream().anyMatch(m -> m.contains("no disponible")));
    }

    @Test
    void listarVehiculosBrigada_retornaDotacionActiva() {
        Vehiculo vehiculo = Vehiculo.builder()
                .id(VEHICULO_ID)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(1000)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        BrigadaVehiculo bv = BrigadaVehiculo.builder()
                .id(100L)
                .idBrigada(BRIGADA_ID)
                .idVehiculo(VEHICULO_ID)
                .principal(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();

        when(brigadaRepository.existsById(BRIGADA_ID)).thenReturn(true);
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(BRIGADA_ID)).thenReturn(List.of(bv));
        when(vehiculoRepository.findById(VEHICULO_ID)).thenReturn(Optional.of(vehiculo));

        var vehiculos = recursoService.listarVehiculosBrigada(BRIGADA_ID);

        assertEquals(1, vehiculos.size());
        assertEquals("ABCD12", vehiculos.getFirst().getPatente());
        assertTrue(vehiculos.getFirst().isPrincipal());
    }

    @Test
    void listarVehiculosBrigada_brigadaInexistente_lanzaExcepcion() {
        when(brigadaRepository.existsById(99L)).thenReturn(false);

        assertThrows(BusinessRuleException.class, () -> recursoService.listarVehiculosBrigada(99L));
    }

    @Test
    void crearVehiculo_valido_persiste() {
        VehiculoRequest request = new VehiculoRequest();
        request.setPatente("abcd12");
        request.setTipo("camion");
        request.setMarca("Mercedes");
        request.setCapacidadPasajeros(10);

        Vehiculo saved = Vehiculo.builder()
                .id(VEHICULO_ID)
                .patente("ABCD12")
                .tipo("CAMION")
                .marca("Mercedes")
                .capacidadPasajeros(10)
                .capacidadCarga(0)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(vehiculoRepository.save(any())).thenReturn(saved);

        var dto = recursoService.crearVehiculo(request);

        assertEquals("ABCD12", dto.getPatente());
        assertEquals("CAMION", dto.getTipo());
        assertEquals(EstadoRecurso.DISPONIBLE, dto.getEstado());
        verify(vehiculoRepository).save(any());
    }

    @Test
    void crearVehiculo_sinPatente_lanzaExcepcion() {
        VehiculoRequest request = new VehiculoRequest();
        request.setTipo("CAMION");

        assertThrows(BusinessRuleException.class, () -> recursoService.crearVehiculo(request));
    }

    @Test
    void crearBrigadista_conRolDefault_persiste() {
        BrigadistaRol rolCombatiente = rolCombatiente();
        when(brigadistaRolRepository.findByCodigo("COMBATIENTE")).thenReturn(Optional.of(rolCombatiente));
        when(brigadistaRolRepository.findById(ROL_COMBATIENTE_ID)).thenReturn(Optional.of(rolCombatiente));

        BrigadistaRequest request = new BrigadistaRequest();
        request.setNombre("Pedro");
        request.setApellido("Soto");
        request.setKeycloakUsername("psoto");
        request.setEmail("psoto@test.cl");

        Brigadista saved = Brigadista.builder()
                .id(COMBATIENTE_ID)
                .nombre("Pedro")
                .apellido("Soto")
                .idRolBrigadista(ROL_COMBATIENTE_ID)
                .keycloakUsername("psoto")
                .email("psoto@test.cl")
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadistaRepository.save(any())).thenReturn(saved);
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(COMBATIENTE_ID))
                .thenReturn(Optional.empty());

        BrigadistaDto dto = recursoService.crearBrigadista(request);

        assertEquals("Pedro", dto.getNombre());
        assertEquals("COMBATIENTE", dto.getRolCodigo());
        verify(brigadistaRepository).save(any());
    }

    @Test
    void crearBrigadista_sinApellido_lanzaExcepcion() {
        BrigadistaRequest request = new BrigadistaRequest();
        request.setNombre("Pedro");

        assertThrows(BusinessRuleException.class, () -> recursoService.crearBrigadista(request));
    }

    @Test
    void obtenerBrigadistaPorKeycloakSub_encontrado() {
        when(brigadistaRolRepository.findById(ROL_JEFE_ID)).thenReturn(Optional.of(rolJefe()));

        UUID sub = UUID.randomUUID();
        Brigadista brigadista = Brigadista.builder()
                .id(JEFE_ID)
                .nombre("Ana")
                .apellido("López")
                .idRolBrigadista(ROL_JEFE_ID)
                .keycloakSub(sub)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadistaRepository.findByKeycloakSub(sub)).thenReturn(Optional.of(brigadista));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(JEFE_ID))
                .thenReturn(Optional.of(BrigadaBrigadista.builder().esJefe(true).build()));

        var dto = recursoService.obtenerBrigadistaPorKeycloakSub(sub);

        assertEquals(JEFE_ID, dto.getId());
        assertEquals("JEFE", dto.getRolCodigo());
        assertTrue(dto.getEsJefe());
    }

    @Test
    void obtenerBrigadistaPorKeycloakSub_noVinculado_lanzaExcepcion() {
        UUID sub = UUID.randomUUID();
        when(brigadistaRepository.findByKeycloakSub(sub)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class, () -> recursoService.obtenerBrigadistaPorKeycloakSub(sub));
        assertEquals("BRIGADISTA_NO_VINCULADO", ex.getCode());
    }

    @Test
    void obtenerBrigadistaPorUsername_encontrado() {
        when(brigadistaRolRepository.findById(ROL_COMBATIENTE_ID)).thenReturn(Optional.of(rolCombatiente()));

        Brigadista brigadista = Brigadista.builder()
                .id(COMBATIENTE_ID)
                .nombre("Carlos")
                .apellido("Muñoz")
                .idRolBrigadista(ROL_COMBATIENTE_ID)
                .keycloakUsername("cmunoz")
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadistaRepository.findByKeycloakUsername("cmunoz")).thenReturn(Optional.of(brigadista));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(COMBATIENTE_ID))
                .thenReturn(Optional.empty());

        var dto = recursoService.obtenerBrigadistaPorUsername("cmunoz");

        assertEquals("Carlos", dto.getNombre());
        assertEquals("COMBATIENTE", dto.getRolCodigo());
    }

    @Test
    void obtenerBrigadistaPorUsername_noVinculado_lanzaExcepcion() {
        when(brigadistaRepository.findByKeycloakUsername("desconocido")).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () -> recursoService.obtenerBrigadistaPorUsername("desconocido"));
    }

    @Test
    void listarAsignacionesActivas_retornaDto() {
        UUID incidenteId = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(50L)
                .incidenteId(incidenteId)
                .brigadaId(BRIGADA_ID)
                .vehiculoId(VEHICULO_ID)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .despachadoPor("operador")
                .build();
        Brigada brigada = Brigada.builder().id(BRIGADA_ID).nombre("Alpha").build();
        Vehiculo vehiculo = Vehiculo.builder().id(VEHICULO_ID).patente("ABCD12").build();

        when(asignacionRepository.findByActivaTrueOrderByCreatedAtDesc()).thenReturn(List.of(asignacion));
        when(brigadaRepository.findById(BRIGADA_ID)).thenReturn(Optional.of(brigada));
        when(vehiculoRepository.findById(VEHICULO_ID)).thenReturn(Optional.of(vehiculo));

        var resultado = recursoService.listarAsignacionesActivas();

        assertEquals(1, resultado.size());
        assertEquals(incidenteId, resultado.getFirst().getIncidenteId());
        assertEquals("Alpha", resultado.getFirst().getBrigadaNombre());
        assertEquals("ABCD12", resultado.getFirst().getVehiculoPatente());
    }

    @Test
    void listarAsignacionesPorIncidente_filtraPorIncidente() {
        UUID incidenteId = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(51L)
                .incidenteId(incidenteId)
                .brigadaId(BRIGADA_ID)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        when(asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId)).thenReturn(List.of(asignacion));
        when(brigadaRepository.findById(BRIGADA_ID))
                .thenReturn(Optional.of(Brigada.builder().id(BRIGADA_ID).nombre("Alpha").build()));

        var resultado = recursoService.listarAsignacionesPorIncidente(incidenteId);

        assertEquals(1, resultado.size());
        assertEquals(51L, resultado.getFirst().getId());
    }

    @Test
    void brigadaTieneAsignacionActivaEnIncidente_retornaTrue() {
        UUID incidenteId = UUID.randomUUID();
        when(asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, BRIGADA_ID))
                .thenReturn(true);

        assertTrue(recursoService.brigadaTieneAsignacionActivaEnIncidente(BRIGADA_ID, incidenteId));
    }

    @Test
    void brigadaTieneAsignacionActivaEnIncidente_retornaFalse() {
        UUID incidenteId = UUID.randomUUID();
        when(asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, BRIGADA_ID))
                .thenReturn(false);

        assertFalse(recursoService.brigadaTieneAsignacionActivaEnIncidente(BRIGADA_ID, incidenteId));
    }

    @Test
    void liberarPorIncidente_desasignaTodasLasActivas() {
        UUID incidenteId = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(60L)
                .incidenteId(incidenteId)
                .brigadaId(BRIGADA_ID)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        Brigada brigada = Brigada.builder()
                .id(BRIGADA_ID)
                .nombre("Alpha")
                .estado(EstadoRecurso.ASIGNADO)
                .build();

        when(asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId)).thenReturn(List.of(asignacion));
        when(asignacionRepository.findByIdAndActivaTrue(60L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaRepository.findById(BRIGADA_ID)).thenReturn(Optional.of(brigada));
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionBrigadistaRepository.findByAsignacionId(60L)).thenReturn(List.of());
        when(brigadistaRepository.findByIdBrigada(BRIGADA_ID)).thenReturn(List.of());
        when(asignacionHerramientaRepository.findByAsignacionId(60L)).thenReturn(List.of());

        recursoService.liberarPorIncidente(incidenteId);

        assertFalse(asignacion.getActiva());
        assertEquals(EstadoRecurso.DISPONIBLE, brigada.getEstado());
        verify(asignacionRepository).save(asignacion);
    }

    @Test
    void evaluarElegibilidadDespacho_integranteNoDisponible_noEsElegible() {
        mockBrigadaCompleta(EstadoRecurso.DISPONIBLE);
        Brigadista combatienteAsignado = Brigadista.builder()
                .id(COMBATIENTE_ID)
                .nombre("Carlos")
                .apellido("Muñoz")
                .idRolBrigadista(ROL_COMBATIENTE_ID)
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        when(brigadistaRepository.findById(COMBATIENTE_ID)).thenReturn(Optional.of(combatienteAsignado));

        var elegibilidad = recursoService.evaluarElegibilidadDespacho(BRIGADA_ID);

        assertFalse(elegibilidad.isListaParaDespacho());
        assertTrue(elegibilidad.getMotivos().stream().anyMatch(m -> m.contains("no disponible")));
    }

    @Test
    void evaluarElegibilidadDespacho_stockInsuficiente_noEsElegible() {
        mockBrigadaCompleta(EstadoRecurso.DISPONIBLE);
        Herramienta sinStock = Herramienta.builder()
                .id(HERRAMIENTA_ID)
                .nombre("Manguera")
                .cantidadTotal(10)
                .cantidadDisponible(1)
                .estado("ACTIVA")
                .build();
        when(herramientaRepository.findById(HERRAMIENTA_ID)).thenReturn(Optional.of(sinStock));

        var elegibilidad = recursoService.evaluarElegibilidadDespacho(BRIGADA_ID);

        assertFalse(elegibilidad.isListaParaDespacho());
        assertTrue(elegibilidad.getMotivos().stream().anyMatch(m -> m.contains("Stock insuficiente")));
    }

    @Test
    void crearBrigadista_sinNombre_lanzaExcepcion() {
        BrigadistaRequest request = new BrigadistaRequest();
        request.setApellido("Soto");

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.crearBrigadista(request));
        assertEquals("NOMBRE_REQUERIDO", ex.getCode());
    }

    @Test
    void crearVehiculo_sinTipo_lanzaExcepcion() {
        VehiculoRequest request = new VehiculoRequest();
        request.setPatente("ABCD12");

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.crearVehiculo(request));
        assertEquals("TIPO_REQUERIDO", ex.getCode());
    }

    private BrigadistaRol rolJefe() {
        return BrigadistaRol.builder()
                .id(ROL_JEFE_ID)
                .codigo("JEFE")
                .nombre("Jefe de brigada")
                .jerarquia(1)
                .estado("ACTIVO")
                .build();
    }

    private BrigadistaRol rolCombatiente() {
        return BrigadistaRol.builder()
                .id(ROL_COMBATIENTE_ID)
                .codigo("COMBATIENTE")
                .nombre("Combatiente")
                .jerarquia(2)
                .estado("ACTIVO")
                .build();
    }

    private void mockBrigadaCompleta(EstadoRecurso estadoBrigada) {
        when(brigadistaRolRepository.findById(ROL_JEFE_ID)).thenReturn(Optional.of(rolJefe()));
        when(brigadistaRolRepository.findById(ROL_COMBATIENTE_ID)).thenReturn(Optional.of(rolCombatiente()));

        Brigada brigada = Brigada.builder()
                .id(BRIGADA_ID)
                .nombre("Brigada Alpha")
                .capacidad(6)
                .estado(estadoBrigada)
                .idJefeBrigadista(JEFE_ID)
                .build();

        Vehiculo vehiculo = Vehiculo.builder()
                .id(VEHICULO_ID)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(1000)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();

        BrigadaVehiculo bv = BrigadaVehiculo.builder()
                .id(100L)
                .idBrigada(BRIGADA_ID)
                .idVehiculo(VEHICULO_ID)
                .principal(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();

        Brigadista jefe = Brigadista.builder()
                .id(JEFE_ID)
                .nombre("Ana")
                .apellido("López")
                .idRolBrigadista(ROL_JEFE_ID)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();

        Brigadista combatiente = Brigadista.builder()
                .id(COMBATIENTE_ID)
                .nombre("Carlos")
                .apellido("Muñoz")
                .idRolBrigadista(ROL_COMBATIENTE_ID)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();

        BrigadaBrigadista membresiaJefe = BrigadaBrigadista.builder()
                .brigadaId(BRIGADA_ID)
                .brigadistaId(JEFE_ID)
                .idRolBrigadista(ROL_JEFE_ID)
                .esJefe(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();

        BrigadaBrigadista membresiaCombatiente = BrigadaBrigadista.builder()
                .brigadaId(BRIGADA_ID)
                .brigadistaId(COMBATIENTE_ID)
                .idRolBrigadista(ROL_COMBATIENTE_ID)
                .esJefe(false)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();

        Herramienta herramienta = Herramienta.builder()
                .id(HERRAMIENTA_ID)
                .nombre("Manguera")
                .cantidadTotal(10)
                .cantidadDisponible(10)
                .estado("ACTIVA")
                .build();

        BrigadaHerramienta bh = BrigadaHerramienta.builder()
                .brigadaId(BRIGADA_ID)
                .herramientaId(HERRAMIENTA_ID)
                .cantidad(2)
                .build();

        when(brigadaRepository.findById(BRIGADA_ID)).thenReturn(Optional.of(brigada));
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(BRIGADA_ID)).thenReturn(List.of(bv));
        when(vehiculoRepository.findById(VEHICULO_ID)).thenReturn(Optional.of(vehiculo));
        when(brigadaBrigadistaRepository.findByBrigadaIdAndActivaTrue(BRIGADA_ID))
                .thenReturn(List.of(membresiaJefe, membresiaCombatiente));
        when(brigadistaRepository.findById(JEFE_ID)).thenReturn(Optional.of(jefe));
        when(brigadistaRepository.findById(COMBATIENTE_ID)).thenReturn(Optional.of(combatiente));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(JEFE_ID))
                .thenReturn(Optional.of(membresiaJefe));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(COMBATIENTE_ID))
                .thenReturn(Optional.of(membresiaCombatiente));
        when(brigadaHerramientaRepository.findByBrigadaId(BRIGADA_ID)).thenReturn(List.of(bh));
        when(herramientaRepository.findById(HERRAMIENTA_ID)).thenReturn(Optional.of(herramienta));
    }
}
