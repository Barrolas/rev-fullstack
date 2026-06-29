package cl.duocuc.rev.recursos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.recursos.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.recursos.dto.BrigadaVehiculosRequest;
import cl.duocuc.rev.recursos.dto.HerramientaCantidadDto;
import cl.duocuc.rev.recursos.dto.TransferirIncidenteRequest;
import cl.duocuc.rev.recursos.entity.Asignacion;
import cl.duocuc.rev.recursos.entity.AsignacionBrigadista;
import cl.duocuc.rev.recursos.entity.AsignacionHerramienta;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.BrigadaBrigadista;
import cl.duocuc.rev.recursos.entity.BrigadaHerramienta;
import cl.duocuc.rev.recursos.entity.BrigadaVehiculo;
import cl.duocuc.rev.recursos.entity.Brigadista;
import cl.duocuc.rev.recursos.entity.BrigadistaRol;
import cl.duocuc.rev.recursos.entity.Herramienta;
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
class RecursoServiceDespachoTest {

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

    @Test
    void desasignar_marcaInactivaYLiberarBrigada() {
        Asignacion asignacion = Asignacion.builder()
                .id(7L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(3L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        Brigada brigada = Brigada.builder()
                .id(3L)
                .nombre("B3")
                .estado(EstadoRecurso.ASIGNADO)
                .build();

        when(asignacionRepository.findByIdAndActivaTrue(7L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaRepository.findById(3L)).thenReturn(Optional.of(brigada));
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionBrigadistaRepository.findByAsignacionId(7L)).thenReturn(List.of());
        when(brigadistaRepository.findByIdBrigada(3L)).thenReturn(List.of());
        when(asignacionHerramientaRepository.findByAsignacionId(7L)).thenReturn(List.of());

        recursoService.desasignar(7L);

        assertEquals(false, asignacion.getActiva());
        assertEquals("LIBERADA", asignacion.getEstadoDespacho());
        assertEquals(EstadoRecurso.DISPONIBLE, brigada.getEstado());
    }

    @Test
    void actualizarEstadoDespacho_transicionValidaAsignadaAEnCamino() {
        Asignacion asignacion = Asignacion.builder()
                .id(8L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(1L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        ActualizarEstadoDespachoRequest request = new ActualizarEstadoDespachoRequest();
        request.setEstadoDespacho("EN_CAMINO");

        when(asignacionRepository.findByIdAndActivaTrue(8L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var dto = recursoService.actualizarEstadoDespacho(8L, request);

        assertEquals("EN_CAMINO", dto.getEstadoDespacho());
        verify(asignacionRepository).save(asignacion);
    }

    @Test
    void actualizarEstadoDespacho_saltoInvalido_lanzaExcepcion() {
        Asignacion asignacion = Asignacion.builder()
                .id(9L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(1L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        ActualizarEstadoDespachoRequest request = new ActualizarEstadoDespachoRequest();
        request.setEstadoDespacho("EN_INCIDENTE");

        when(asignacionRepository.findByIdAndActivaTrue(9L)).thenReturn(Optional.of(asignacion));

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class, () -> recursoService.actualizarEstadoDespacho(9L, request));
        assertEquals("TRANSICION_INVALIDA", ex.getCode());
    }

    @Test
    void actualizarEstadoDespacho_transicionValidaEnCaminoAEnIncidente() {
        Asignacion asignacion = Asignacion.builder()
                .id(10L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(1L)
                .activa(true)
                .estadoDespacho("EN_CAMINO")
                .createdAt(LocalDateTime.now())
                .build();
        ActualizarEstadoDespachoRequest request = new ActualizarEstadoDespachoRequest();
        request.setEstadoDespacho("EN_INCIDENTE");

        when(asignacionRepository.findByIdAndActivaTrue(10L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var dto = recursoService.actualizarEstadoDespacho(10L, request);

        assertEquals("EN_INCIDENTE", dto.getEstadoDespacho());
    }

    @Test
    void actualizarEstadoDespacho_requestNulo_lanzaExcepcion() {
        assertThrows(BusinessRuleException.class, () -> recursoService.actualizarEstadoDespacho(11L, null));
    }

    @Test
    void obtenerAsignacionActiva_encontrada() {
        UUID incidenteId = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(12L)
                .incidenteId(incidenteId)
                .brigadaId(3L)
                .vehiculoId(5L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .despachadoPor("coord")
                .build();
        when(asignacionRepository.findByIdAndActivaTrue(12L)).thenReturn(Optional.of(asignacion));
        when(brigadaRepository.findById(3L))
                .thenReturn(Optional.of(Brigada.builder().id(3L).nombre("Brigada 3").build()));
        when(vehiculoRepository.findById(5L))
                .thenReturn(Optional.of(Vehiculo.builder().id(5L).patente("XYZ123").build()));

        var dto = recursoService.obtenerAsignacionActiva(12L);

        assertEquals(12L, dto.getId());
        assertEquals("Brigada 3", dto.getBrigadaNombre());
        assertEquals("XYZ123", dto.getVehiculoPatente());
    }

    @Test
    void obtenerAsignacionActiva_noEncontrada_lanzaExcepcion() {
        when(asignacionRepository.findByIdAndActivaTrue(99L)).thenReturn(Optional.empty());

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.obtenerAsignacionActiva(99L));
        assertEquals("ASIGNACION_NO_ENCONTRADA", ex.getCode());
    }

    @Test
    void transferirIncidente_actualizaIncidenteId() {
        UUID incidenteOriginal = UUID.randomUUID();
        UUID incidenteNuevo = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(20L)
                .incidenteId(incidenteOriginal)
                .brigadaId(1L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        TransferirIncidenteRequest request = new TransferirIncidenteRequest();
        request.setAsignacionIds(List.of(20L));
        request.setNuevoIncidenteId(incidenteNuevo);

        when(asignacionRepository.findById(20L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaRepository.findById(1L))
                .thenReturn(Optional.of(Brigada.builder().id(1L).nombre("B1").build()));

        var resultado = recursoService.transferirIncidente(request);

        assertEquals(1, resultado.size());
        assertEquals(incidenteNuevo, asignacion.getIncidenteId());
        assertEquals(incidenteNuevo, resultado.getFirst().getIncidenteId());
    }

    @Test
    void transferirIncidente_asignacionInactiva_lanzaExcepcion() {
        UUID incidenteNuevo = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(21L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(1L)
                .activa(false)
                .estadoDespacho("LIBERADA")
                .createdAt(LocalDateTime.now())
                .build();
        TransferirIncidenteRequest request = new TransferirIncidenteRequest();
        request.setAsignacionIds(List.of(21L));
        request.setNuevoIncidenteId(incidenteNuevo);

        when(asignacionRepository.findById(21L)).thenReturn(Optional.of(asignacion));

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.transferirIncidente(request));
        assertEquals("ASIGNACION_INACTIVA", ex.getCode());
    }

    @Test
    void transferirIncidente_sinIds_lanzaExcepcion() {
        TransferirIncidenteRequest request = new TransferirIncidenteRequest();
        request.setNuevoIncidenteId(UUID.randomUUID());

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.transferirIncidente(request));
        assertEquals("VALIDATION", ex.getCode());
    }

    @Test
    void listarPorIncidente_incluyeRecursosAsignados() {
        UUID incidenteId = UUID.randomUUID();
        Asignacion asignacion = Asignacion.builder()
                .id(30L)
                .incidenteId(incidenteId)
                .brigadaId(2L)
                .vehiculoId(4L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        Brigada brigada = Brigada.builder()
                .id(2L)
                .nombre("Brigada Beta")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Vehiculo vehiculo = Vehiculo.builder()
                .id(4L)
                .patente("DEFG34")
                .tipo("CAMIONETA")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Brigadista brigadista = Brigadista.builder()
                .id(7L)
                .nombre("Luis")
                .apellido("Pérez")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Herramienta herramienta = Herramienta.builder()
                .id(8L)
                .nombre("Extintor")
                .build();

        when(asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId)).thenReturn(List.of(asignacion));
        when(brigadaRepository.findById(2L)).thenReturn(Optional.of(brigada));
        when(vehiculoRepository.findById(4L)).thenReturn(Optional.of(vehiculo));
        when(asignacionBrigadistaRepository.findByAsignacionId(30L))
                .thenReturn(List.of(AsignacionBrigadista.builder().asignacionId(30L).brigadistaId(7L).build()));
        when(brigadistaRepository.findById(7L)).thenReturn(Optional.of(brigadista));
        when(asignacionHerramientaRepository.findByAsignacionId(30L))
                .thenReturn(List.of(AsignacionHerramienta.builder()
                        .asignacionId(30L)
                        .herramientaId(8L)
                        .cantidad(2)
                        .build()));
        when(herramientaRepository.findById(8L)).thenReturn(Optional.of(herramienta));

        var recursos = recursoService.listarPorIncidente(incidenteId);

        assertEquals(4, recursos.size());
        assertNotNull(recursos.stream().filter(r -> "BRIGADA".equals(r.getTipo())).findFirst().orElse(null));
        assertNotNull(recursos.stream().filter(r -> "VEHICULO".equals(r.getTipo())).findFirst().orElse(null));
        assertNotNull(recursos.stream().filter(r -> "BRIGADISTA".equals(r.getTipo())).findFirst().orElse(null));
        assertNotNull(recursos.stream().filter(r -> "HERRAMIENTA".equals(r.getTipo())).findFirst().orElse(null));
    }

    @Test
    void desasignar_conVehiculoBrigadistasYHerramientas_liberaTodo() {
        Asignacion asignacion = Asignacion.builder()
                .id(40L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(3L)
                .vehiculoId(6L)
                .activa(true)
                .estadoDespacho("EN_CAMINO")
                .createdAt(LocalDateTime.now())
                .build();
        Brigada brigada = Brigada.builder()
                .id(3L)
                .nombre("B3")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Vehiculo vehiculo = Vehiculo.builder()
                .id(6L)
                .patente("HIJK56")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Brigadista brigadista = Brigadista.builder()
                .id(9L)
                .nombre("María")
                .apellido("García")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Herramienta herramienta = Herramienta.builder()
                .id(10L)
                .nombre("Manguera")
                .cantidadDisponible(3)
                .build();

        when(asignacionRepository.findByIdAndActivaTrue(40L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaRepository.findById(3L)).thenReturn(Optional.of(brigada));
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(vehiculoRepository.findById(6L)).thenReturn(Optional.of(vehiculo));
        when(vehiculoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionBrigadistaRepository.findByAsignacionId(40L))
                .thenReturn(List.of(AsignacionBrigadista.builder().asignacionId(40L).brigadistaId(9L).build()));
        when(brigadistaRepository.findById(9L)).thenReturn(Optional.of(brigadista));
        when(brigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionHerramientaRepository.findByAsignacionId(40L))
                .thenReturn(List.of(AsignacionHerramienta.builder()
                        .asignacionId(40L)
                        .herramientaId(10L)
                        .cantidad(2)
                        .build()));
        when(herramientaRepository.findById(10L)).thenReturn(Optional.of(herramienta));
        when(herramientaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        recursoService.desasignar(40L);

        assertEquals(EstadoRecurso.DISPONIBLE, brigada.getEstado());
        assertEquals(EstadoRecurso.DISPONIBLE, vehiculo.getEstado());
        assertEquals(EstadoRecurso.DISPONIBLE, brigadista.getEstado());
        assertEquals(5, herramienta.getCantidadDisponible());
        verify(asignacionBrigadistaRepository).deleteByAsignacionId(40L);
        verify(asignacionHerramientaRepository).deleteByAsignacionId(40L);
    }

    @Test
    void actualizarComposicion_vinculaIntegrantesVehiculosYHerramientas() {
        Long brigadaId = 1L;
        Long jefeId = 10L;
        Long combatienteId = 11L;
        Long vehiculoId = 20L;
        Long herramientaId = 30L;

        Brigada brigada = Brigada.builder()
                .id(brigadaId)
                .nombre("Alpha")
                .capacidad(6)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadaRepository.findById(brigadaId)).thenReturn(Optional.of(brigada));
        when(brigadaBrigadistaRepository.findByBrigadaIdAndActivaTrue(brigadaId))
                .thenReturn(List.of())
                .thenReturn(List.of(
                        BrigadaBrigadista.builder()
                                .brigadaId(brigadaId)
                                .brigadistaId(jefeId)
                                .idRolBrigadista(1L)
                                .esJefe(true)
                                .activa(true)
                                .fDesde(LocalDateTime.now())
                                .build(),
                        BrigadaBrigadista.builder()
                                .brigadaId(brigadaId)
                                .brigadistaId(combatienteId)
                                .idRolBrigadista(2L)
                                .esJefe(false)
                                .activa(true)
                                .fDesde(LocalDateTime.now())
                                .build()));

        BrigadistaRol rolJefe = BrigadistaRol.builder()
                .id(1L)
                .codigo("JEFE")
                .nombre("Jefe")
                .jerarquia(1)
                .estado("ACTIVO")
                .build();
        BrigadistaRol rolCombatiente = BrigadistaRol.builder()
                .id(2L)
                .codigo("COMBATIENTE")
                .nombre("Combatiente")
                .jerarquia(2)
                .estado("ACTIVO")
                .build();
        when(brigadistaRolRepository.findByCodigo("JEFE")).thenReturn(Optional.of(rolJefe));
        when(brigadistaRolRepository.findByCodigo("COMBATIENTE")).thenReturn(Optional.of(rolCombatiente));
        when(brigadistaRolRepository.findById(1L)).thenReturn(Optional.of(rolJefe));
        when(brigadistaRolRepository.findById(2L)).thenReturn(Optional.of(rolCombatiente));

        Brigadista jefe = Brigadista.builder()
                .id(jefeId)
                .nombre("Ana")
                .apellido("López")
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        Brigadista combatiente = Brigadista.builder()
                .id(combatienteId)
                .nombre("Carlos")
                .apellido("Muñoz")
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadistaRepository.findById(jefeId)).thenReturn(Optional.of(jefe));
        when(brigadistaRepository.findById(combatienteId)).thenReturn(Optional.of(combatiente));
        when(brigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(any())).thenReturn(Optional.empty());
        when(brigadaBrigadistaRepository.findByBrigadaIdAndBrigadistaIdAndActivaTrue(any(), any()))
                .thenReturn(Optional.empty());
        when(brigadaBrigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Vehiculo vehiculo = Vehiculo.builder()
                .id(vehiculoId)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(0)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(vehiculoRepository.findById(vehiculoId)).thenReturn(Optional.of(vehiculo));
        when(brigadaVehiculoRepository.existsByIdVehiculoAndActivaTrueAndIdBrigadaNot(vehiculoId, brigadaId))
                .thenReturn(false);
        when(brigadaVehiculoRepository.findByIdBrigada(brigadaId)).thenReturn(List.of());
        when(brigadaVehiculoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        BrigadaVehiculo bv = BrigadaVehiculo.builder()
                .id(100L)
                .idBrigada(brigadaId)
                .idVehiculo(vehiculoId)
                .principal(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigadaId)).thenReturn(List.of(bv));

        Herramienta herramienta = Herramienta.builder()
                .id(herramientaId)
                .nombre("Manguera")
                .cantidadTotal(10)
                .cantidadDisponible(10)
                .estado("ACTIVA")
                .build();
        when(herramientaRepository.findById(herramientaId)).thenReturn(Optional.of(herramienta));
        when(brigadaHerramientaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaHerramientaRepository.findByBrigadaId(brigadaId))
                .thenReturn(List.of(BrigadaHerramienta.builder()
                        .brigadaId(brigadaId)
                        .herramientaId(herramientaId)
                        .cantidad(2)
                        .build()));

        BrigadaComposicionRequest request = new BrigadaComposicionRequest();
        request.setJefeBrigadistaId(jefeId);
        request.setBrigadistaIds(List.of(combatienteId));
        request.setVehiculoIds(List.of(vehiculoId));
        request.setPrincipalVehiculoId(vehiculoId);
        HerramientaCantidadDto item = new HerramientaCantidadDto();
        item.setHerramientaId(herramientaId);
        item.setCantidad(2);
        request.setHerramientas(List.of(item));

        var detalle = recursoService.actualizarComposicion(brigadaId, request);

        assertEquals(jefeId, detalle.getIdJefeBrigadista());
        assertTrue(detalle.isListaParaDespacho());
        verify(brigadaHerramientaRepository).deleteByBrigadaId(brigadaId);
    }

    @Test
    void actualizarComposicion_capacidadExcedida_lanzaExcepcion() {
        Brigada brigada = Brigada.builder()
                .id(1L)
                .nombre("Alpha")
                .capacidad(1)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadaRepository.findById(1L)).thenReturn(Optional.of(brigada));

        BrigadaComposicionRequest request = new BrigadaComposicionRequest();
        request.setBrigadistaIds(List.of(10L, 11L, 12L));

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.actualizarComposicion(1L, request));
        assertEquals("CAPACIDAD_EXCEDIDA", ex.getCode());
    }

    @Test
    void actualizarVehiculosBrigada_aplicaDotacion() {
        Long brigadaId = 1L;
        Long vehiculoId = 20L;
        Brigada brigada = Brigada.builder()
                .id(brigadaId)
                .nombre("Alpha")
                .capacidad(6)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadaRepository.findById(brigadaId)).thenReturn(Optional.of(brigada));
        when(brigadaRepository.existsById(brigadaId)).thenReturn(true);

        Vehiculo vehiculo = Vehiculo.builder()
                .id(vehiculoId)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(0)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(vehiculoRepository.findById(vehiculoId)).thenReturn(Optional.of(vehiculo));
        when(brigadaVehiculoRepository.existsByIdVehiculoAndActivaTrueAndIdBrigadaNot(vehiculoId, brigadaId))
                .thenReturn(false);
        when(brigadaVehiculoRepository.findByIdBrigada(brigadaId)).thenReturn(List.of());
        when(brigadaVehiculoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        BrigadaVehiculo bv = BrigadaVehiculo.builder()
                .id(100L)
                .idBrigada(brigadaId)
                .idVehiculo(vehiculoId)
                .principal(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigadaId)).thenReturn(List.of(bv));

        BrigadaVehiculosRequest request = new BrigadaVehiculosRequest();
        request.setVehiculoIds(List.of(vehiculoId));
        request.setPrincipalVehiculoId(vehiculoId);

        var vehiculos = recursoService.actualizarVehiculosBrigada(brigadaId, request);

        assertEquals(1, vehiculos.size());
        assertEquals("ABCD12", vehiculos.getFirst().getPatente());
        verify(brigadaVehiculoRepository).save(any());
    }

    @Test
    void actualizarVehiculosBrigada_sinVehiculos_lanzaExcepcion() {
        when(brigadaRepository.findById(1L))
                .thenReturn(Optional.of(Brigada.builder()
                        .id(1L)
                        .capacidad(6)
                        .estado(EstadoRecurso.DISPONIBLE)
                        .build()));

        BrigadaVehiculosRequest request = new BrigadaVehiculosRequest();
        request.setVehiculoIds(List.of());

        BusinessRuleException ex = assertThrows(
                BusinessRuleException.class, () -> recursoService.actualizarVehiculosBrigada(1L, request));
        assertEquals("VEHICULOS_REQUERIDOS", ex.getCode());
    }

    @Test
    void vincularKeycloakSub_actualizaBrigadista() {
        UUID sub = UUID.randomUUID();
        Brigadista brigadista = Brigadista.builder()
                .id(15L)
                .nombre("Pedro")
                .apellido("Soto")
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadistaRepository.findById(15L)).thenReturn(Optional.of(brigadista));
        when(brigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(15L)).thenReturn(Optional.empty());

        var dto = recursoService.vincularKeycloakSub(15L, sub, "psoto", "psoto@test.cl");

        assertEquals("psoto", dto.getKeycloakUsername());
        assertEquals("psoto@test.cl", dto.getEmail());
        assertEquals(sub, brigadista.getKeycloakSub());
    }

    @Test
    void listarAsignacionesActivasPorBrigada_retornaOrdenadas() {
        Asignacion asignacion = Asignacion.builder()
                .id(70L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(2L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        when(asignacionRepository.findByBrigadaIdAndActivaTrueOrderByCreatedAtDesc(2L))
                .thenReturn(List.of(asignacion));
        when(brigadaRepository.findById(2L))
                .thenReturn(Optional.of(Brigada.builder().id(2L).nombre("Beta").build()));

        var resultado = recursoService.listarAsignacionesActivasPorBrigada(2L);

        assertEquals(1, resultado.size());
        assertEquals(70L, resultado.getFirst().getId());
    }

    @Test
    void listarIncidenteIdsActivosPorBrigada_retornaDistinct() {
        UUID incidente1 = UUID.randomUUID();
        UUID incidente2 = UUID.randomUUID();
        when(asignacionRepository.findByBrigadaIdAndActivaTrueOrderByCreatedAtDesc(2L))
                .thenReturn(List.of(
                        Asignacion.builder()
                                .id(71L)
                                .incidenteId(incidente1)
                                .brigadaId(2L)
                                .activa(true)
                                .estadoDespacho("ASIGNADA")
                                .createdAt(LocalDateTime.now())
                                .build(),
                        Asignacion.builder()
                                .id(72L)
                                .incidenteId(incidente1)
                                .brigadaId(2L)
                                .activa(true)
                                .estadoDespacho("EN_CAMINO")
                                .createdAt(LocalDateTime.now())
                                .build(),
                        Asignacion.builder()
                                .id(73L)
                                .incidenteId(incidente2)
                                .brigadaId(2L)
                                .activa(true)
                                .estadoDespacho("ASIGNADA")
                                .createdAt(LocalDateTime.now())
                                .build()));

        var ids = recursoService.listarIncidenteIdsActivosPorBrigada(2L);

        assertEquals(2, ids.size());
        assertTrue(ids.contains(incidente1));
        assertTrue(ids.contains(incidente2));
    }

    @Test
    void transferirIncidente_sinNuevoIncidenteId_lanzaExcepcion() {
        TransferirIncidenteRequest request = new TransferirIncidenteRequest();
        request.setAsignacionIds(List.of(1L));

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.transferirIncidente(request));
        assertEquals("VALIDATION", ex.getCode());
    }

    @Test
    void asignar_conComposicionCompleta_aplicaIntegrantesYKit() {
        UUID incidenteId = UUID.randomUUID();
        Long brigadaId = 1L;
        Long jefeId = 10L;
        Long combatienteId = 11L;
        Long vehiculoId = 20L;
        Long herramientaId = 30L;

        mockBrigadaListaParaDespacho(brigadaId, jefeId, combatienteId, vehiculoId, herramientaId);

        when(asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, brigadaId))
                .thenReturn(false);
        when(asignacionRepository.save(any())).thenAnswer(inv -> {
            Asignacion a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(herramientaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionBrigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionHerramientaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AsignarRequest request = new AsignarRequest();
        request.setIncidenteId(incidenteId);
        request.setBrigadaId(brigadaId);
        request.setUsarComposicionBrigada(true);
        request.setDespachadoPor("coord");

        var response = recursoService.asignar(request);

        assertEquals(100L, response.getId());
        verify(asignacionBrigadistaRepository, org.mockito.Mockito.times(2)).save(any());
        verify(asignacionHerramientaRepository).save(any());
    }

    @Test
    void asignar_datosInvalidos_lanzaExcepcion() {
        AsignarRequest request = new AsignarRequest();
        request.setBrigadaId(1L);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> recursoService.asignar(request));
        assertEquals("DATOS_INVALIDOS", ex.getCode());
    }

    @Test
    void desasignar_sinAsignacionBrigadistas_liberaBrigadistasDeBrigada() {
        Asignacion asignacion = Asignacion.builder()
                .id(80L)
                .incidenteId(UUID.randomUUID())
                .brigadaId(4L)
                .activa(true)
                .estadoDespacho("ASIGNADA")
                .createdAt(LocalDateTime.now())
                .build();
        Brigada brigada = Brigada.builder()
                .id(4L)
                .nombre("B4")
                .estado(EstadoRecurso.ASIGNADO)
                .build();
        Brigadista brigadista = Brigadista.builder()
                .id(14L)
                .nombre("Juan")
                .apellido("Díaz")
                .estado(EstadoRecurso.ASIGNADO)
                .build();

        when(asignacionRepository.findByIdAndActivaTrue(80L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(brigadaRepository.findById(4L)).thenReturn(Optional.of(brigada));
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionBrigadistaRepository.findByAsignacionId(80L)).thenReturn(List.of());
        when(brigadistaRepository.findByIdBrigada(4L)).thenReturn(List.of(brigadista));
        when(brigadistaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionHerramientaRepository.findByAsignacionId(80L)).thenReturn(List.of());

        recursoService.desasignar(80L);

        assertEquals(EstadoRecurso.DISPONIBLE, brigadista.getEstado());
    }

    private void mockBrigadaListaParaDespacho(
            Long brigadaId, Long jefeId, Long combatienteId, Long vehiculoId, Long herramientaId) {
        Brigada brigada = Brigada.builder()
                .id(brigadaId)
                .nombre("Alpha")
                .capacidad(6)
                .estado(EstadoRecurso.DISPONIBLE)
                .idJefeBrigadista(jefeId)
                .build();
        when(brigadaRepository.findById(brigadaId)).thenReturn(Optional.of(brigada));

        Vehiculo vehiculo = Vehiculo.builder()
                .id(vehiculoId)
                .patente("ABCD12")
                .tipo("CAMION")
                .capacidadPasajeros(8)
                .capacidadCarga(0)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        BrigadaVehiculo bv = BrigadaVehiculo.builder()
                .id(100L)
                .idBrigada(brigadaId)
                .idVehiculo(vehiculoId)
                .principal(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigadaId)).thenReturn(List.of(bv));
        when(vehiculoRepository.findById(vehiculoId)).thenReturn(Optional.of(vehiculo));

        BrigadistaRol rolJefe = BrigadistaRol.builder()
                .id(1L)
                .codigo("JEFE")
                .nombre("Jefe")
                .jerarquia(1)
                .estado("ACTIVO")
                .build();
        BrigadistaRol rolCombatiente = BrigadistaRol.builder()
                .id(2L)
                .codigo("COMBATIENTE")
                .nombre("Combatiente")
                .jerarquia(2)
                .estado("ACTIVO")
                .build();
        when(brigadistaRolRepository.findById(1L)).thenReturn(Optional.of(rolJefe));
        when(brigadistaRolRepository.findById(2L)).thenReturn(Optional.of(rolCombatiente));

        Brigadista jefe = Brigadista.builder()
                .id(jefeId)
                .nombre("Ana")
                .apellido("López")
                .idRolBrigadista(1L)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        Brigadista combatiente = Brigadista.builder()
                .id(combatienteId)
                .nombre("Carlos")
                .apellido("Muñoz")
                .idRolBrigadista(2L)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadistaRepository.findById(jefeId)).thenReturn(Optional.of(jefe));
        when(brigadistaRepository.findById(combatienteId)).thenReturn(Optional.of(combatiente));

        BrigadaBrigadista mbJefe = BrigadaBrigadista.builder()
                .brigadaId(brigadaId)
                .brigadistaId(jefeId)
                .idRolBrigadista(1L)
                .esJefe(true)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();
        BrigadaBrigadista mbCombatiente = BrigadaBrigadista.builder()
                .brigadaId(brigadaId)
                .brigadistaId(combatienteId)
                .idRolBrigadista(2L)
                .esJefe(false)
                .activa(true)
                .fDesde(LocalDateTime.now())
                .build();
        when(brigadaBrigadistaRepository.findByBrigadaIdAndActivaTrue(brigadaId))
                .thenReturn(List.of(mbJefe, mbCombatiente));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(jefeId))
                .thenReturn(Optional.of(mbJefe));
        when(brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(combatienteId))
                .thenReturn(Optional.of(mbCombatiente));

        Herramienta herramienta = Herramienta.builder()
                .id(herramientaId)
                .nombre("Manguera")
                .cantidadTotal(10)
                .cantidadDisponible(10)
                .estado("ACTIVA")
                .build();
        when(herramientaRepository.findById(herramientaId)).thenReturn(Optional.of(herramienta));
        when(brigadaHerramientaRepository.findByBrigadaId(brigadaId))
                .thenReturn(List.of(BrigadaHerramienta.builder()
                        .brigadaId(brigadaId)
                        .herramientaId(herramientaId)
                        .cantidad(2)
                        .build()));
    }
}
