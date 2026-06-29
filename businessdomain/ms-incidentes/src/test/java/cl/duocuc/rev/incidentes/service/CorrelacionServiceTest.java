package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.config.CorrelacionProperties;
import cl.duocuc.rev.incidentes.correlacion.CorrelacionPairOrder;
import cl.duocuc.rev.incidentes.correlacion.CorrelacionScorer;
import cl.duocuc.rev.incidentes.dto.ConfirmarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.DescartarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.VincularIncidenteRequest;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.entity.IncidenteCorrelacion;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.repository.IncidenteCorrelacionRepository;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CorrelacionServiceTest {

    @Mock
    private IncidenteRepository incidenteRepository;

    @Mock
    private IncidenteCorrelacionRepository correlacionRepository;

    @Mock
    private CorrelacionScorer correlacionScorer;

    @Mock
    private CorrelacionProperties correlacionProperties;

    @InjectMocks
    private CorrelacionService correlacionService;

    private UUID idA;
    private UUID idB;
    private UUID correlacionId;
    private Incidente incidenteA;
    private Incidente incidenteB;
    private IncidenteCorrelacion correlacion;

    @BeforeEach
    void setUp() {
        idA = UUID.randomUUID();
        idB = UUID.randomUUID();
        correlacionId = UUID.randomUUID();

        incidenteA = Incidente.builder()
                .id(idA)
                .folio("REV-001")
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .descripcion("A")
                .build();
        incidenteB = Incidente.builder()
                .id(idB)
                .folio("REV-002")
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .descripcion("B")
                .incidenteCanonicoId(idA)
                .build();

        correlacion = IncidenteCorrelacion.builder()
                .id(correlacionId)
                .incidenteAId(idA)
                .incidenteBId(idB)
                .score((short) 85)
                .distanciaMetros(120)
                .deltaMinutos(5)
                .motivo(new LinkedHashMap<>(Map.of("radioMetros", 400)))
                .estado(EstadoCorrelacion.CONFIRMADA)
                .incidenteCanonicoId(idA)
                .decididoPor("operador")
                .decididoAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void revertir_desvinculaSoloElParYVuelveAPendiente() {
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = correlacionService.revertir(correlacionId, "supervisor");

        assertEquals(EstadoCorrelacion.PENDIENTE, response.getEstado());
        assertNull(response.getIncidenteCanonicoId());
        assertNull(incidenteB.getIncidenteCanonicoId());
        verify(incidenteRepository).save(incidenteB);

        ArgumentCaptor<IncidenteCorrelacion> captor = ArgumentCaptor.forClass(IncidenteCorrelacion.class);
        verify(correlacionRepository).save(captor.capture());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> reversiones =
                (List<Map<String, Object>>) captor.getValue().getMotivo().get("reversiones");
        assertEquals(1, reversiones.size());
        assertEquals("supervisor", reversiones.get(0).get("usuario"));
    }

    @Test
    void revertir_fallaSiNoEstaConfirmada() {
        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));

        assertThrows(BusinessRuleException.class, () -> correlacionService.revertir(correlacionId, "op"));
    }

    @Test
    void listarPorEstado_delegaAlRepositorio() {
        when(correlacionRepository.findByEstadoOrderByScoreDescCreatedAtDesc(EstadoCorrelacion.CONFIRMADA))
                .thenReturn(List.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        var list = correlacionService.listarPorEstado(EstadoCorrelacion.CONFIRMADA);

        assertEquals(1, list.size());
        assertEquals(correlacionId, list.get(0).getId());
    }

    @Test
    void reabrir_descartadaVuelveAPendiente() {
        correlacion.setEstado(EstadoCorrelacion.DESCARTADA);
        incidenteB.setIncidenteCanonicoId(null);
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = correlacionService.reabrir(correlacionId, "operador");

        assertEquals(EstadoCorrelacion.PENDIENTE, response.getEstado());
    }

    @Test
    void confirmar_vinculaParYMarcaConfirmada() {
        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        ConfirmarCorrelacionRequest request = new ConfirmarCorrelacionRequest();
        request.setIncidenteCanonicoId(idA);

        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));
        when(incidenteRepository.findByIncidenteCanonicoId(any())).thenReturn(List.of());
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = correlacionService.confirmar(correlacionId, request, "operador");

        assertEquals(EstadoCorrelacion.CONFIRMADA, response.getEstado());
        assertEquals(idA, response.getIncidenteCanonicoId());
        assertEquals("operador", response.getDecididoPor());
        verify(incidenteRepository).save(incidenteB);
    }

    @Test
    void descartar_pendienteConMotivo() {
        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        DescartarCorrelacionRequest request = new DescartarCorrelacionRequest();
        request.setMotivo("No son el mismo evento");

        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = correlacionService.descartar(correlacionId, request, "operador");

        assertEquals(EstadoCorrelacion.DESCARTADA, response.getEstado());
        assertEquals("No son el mismo evento", response.getMotivo().get("motivoDescarte"));
    }

    @Test
    void obtener_devuelveCorrelacion() {
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        var response = correlacionService.obtener(correlacionId);

        assertEquals(correlacionId, response.getId());
        assertEquals((short) 85, response.getScore());
    }

    @Test
    void listarPorIncidente_devuelveCorrelacionesDelIncidente() {
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(correlacionRepository.findAllByIncidenteId(idA)).thenReturn(List.of(correlacion));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        var list = correlacionService.listarPorIncidente(idA);

        assertEquals(1, list.size());
        assertEquals(correlacionId, list.get(0).getId());
    }

    @Test
    void obtenerGrupo_incluyeCanonicoVinculadosYSugerencias() {
        UUID idC = UUID.randomUUID();
        Incidente incidenteC = Incidente.builder()
                .id(idC)
                .folio("REV-003")
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .incidenteCanonicoId(idA)
                .build();
        IncidenteCorrelacion pendiente = IncidenteCorrelacion.builder()
                .id(UUID.randomUUID())
                .incidenteAId(idA)
                .incidenteBId(idC)
                .score((short) 70)
                .estado(EstadoCorrelacion.PENDIENTE)
                .build();

        when(incidenteRepository.findById(idC)).thenReturn(Optional.of(incidenteC));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findByIncidenteCanonicoId(idA)).thenReturn(List.of(incidenteB, incidenteC));
        when(correlacionRepository.findByIncidenteAndEstado(idA, EstadoCorrelacion.PENDIENTE))
                .thenReturn(List.of(pendiente));

        var grupo = correlacionService.obtenerGrupo(idC);

        assertEquals(idA, grupo.getIncidenteCanonicoId());
        assertEquals("REV-001", grupo.getFolioCanonico());
        assertEquals(2, grupo.getVinculados().size());
        assertEquals(1, grupo.getSugerenciasPendientes().size());
    }

    @Test
    void obtenerPorFolio_normalizaYDevuelveResumen() {
        when(incidenteRepository.findByFolio("REV-001")).thenReturn(Optional.of(incidenteA));

        var resumen = correlacionService.obtenerPorFolio(" rev-001 ");

        assertEquals(idA, resumen.getId());
        assertEquals("REV-001", resumen.getFolio());
    }

    @Test
    void resumenes_listaVacia() {
        assertTrue(correlacionService.resumenes(null).isEmpty());
        assertTrue(correlacionService.resumenes(List.of()).isEmpty());
    }

    @Test
    void resumenes_conIdsDevuelveResumenPorIncidente() {
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.countByIncidenteCanonicoId(idA)).thenReturn(2L);
        when(correlacionRepository.countPendientesByIncidenteId(idA)).thenReturn(1L);
        when(correlacionRepository.maxScorePendienteByIncidenteId(idA)).thenReturn((short) 75);

        var list = correlacionService.resumenes(List.of(idA));

        assertEquals(1, list.size());
        assertEquals(idA, list.get(0).getIncidenteId());
        assertEquals(idA, list.get(0).getIncidenteCanonicoId());
        assertTrue(list.get(0).isEsCanonico());
        assertEquals(2L, list.get(0).getCantidadReportesVinculados());
    }

    @Test
    void evaluarNuevoIncidente_sinGps_noBuscaCandidatos() {
        UUID id = UUID.randomUUID();
        Incidente sinGps = Incidente.builder()
                .id(id)
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .build();
        when(incidenteRepository.findById(id)).thenReturn(Optional.of(sinGps));

        correlacionService.evaluarNuevoIncidente(id);

        verify(incidenteRepository, never()).findCandidatosCorrelacion(
                any(), anyList(), any(), anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void evaluarNuevoIncidente_conCandidatos_creaCorrelacionPendiente() {
        UUID idOrigen = UUID.randomUUID();
        UUID idCandidato = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.of(2026, 6, 29, 12, 0);

        Incidente origen = Incidente.builder()
                .id(idOrigen)
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.45)
                .lng(-70.66)
                .createdAt(now)
                .build();
        Incidente candidato = Incidente.builder()
                .id(idCandidato)
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.451)
                .lng(-70.661)
                .createdAt(now.plusMinutes(10))
                .build();

        CorrelacionProperties.ReglasTipo reglas = new CorrelacionProperties.ReglasTipo();
        reglas.setRadioMetros(500);
        reglas.setVentanaMinutos(90);
        Map<String, Object> motivo = new LinkedHashMap<>(Map.of("score", 85));
        CorrelacionScorer.ResultadoPuntaje puntaje =
                new CorrelacionScorer.ResultadoPuntaje(85, 120.0, 10, motivo);
        CorrelacionPairOrder.OrderedPair par = CorrelacionPairOrder.ordenar(idOrigen, idCandidato);

        when(incidenteRepository.findById(idOrigen)).thenReturn(Optional.of(origen));
        when(correlacionProperties.reglasPara("FORESTAL")).thenReturn(reglas);
        when(correlacionProperties.getUmbralScore()).thenReturn(60);
        when(incidenteRepository.findCandidatosCorrelacion(
                eq(idOrigen), anyList(), any(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(candidato));
        when(correlacionScorer.calcular(origen, candidato)).thenReturn(puntaje);
        when(correlacionRepository.findByIncidenteAIdAndIncidenteBId(par.incidenteAId(), par.incidenteBId()))
                .thenReturn(Optional.empty());
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        correlacionService.evaluarNuevoIncidente(idOrigen);

        ArgumentCaptor<IncidenteCorrelacion> captor = ArgumentCaptor.forClass(IncidenteCorrelacion.class);
        verify(correlacionRepository).save(captor.capture());
        assertEquals(EstadoCorrelacion.PENDIENTE, captor.getValue().getEstado());
        assertEquals((short) 85, captor.getValue().getScore());
    }

    @Test
    void evaluarNuevoIncidente_correlacionExistente_actualizaPuntaje() {
        UUID idOrigen = UUID.randomUUID();
        UUID idCandidato = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.of(2026, 6, 29, 12, 0);

        Incidente origen = Incidente.builder()
                .id(idOrigen)
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.45)
                .lng(-70.66)
                .createdAt(now)
                .build();
        Incidente candidato = Incidente.builder()
                .id(idCandidato)
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.451)
                .lng(-70.661)
                .createdAt(now.plusMinutes(5))
                .build();

        CorrelacionProperties.ReglasTipo reglas = new CorrelacionProperties.ReglasTipo();
        reglas.setRadioMetros(500);
        reglas.setVentanaMinutos(90);
        CorrelacionPairOrder.OrderedPair par = CorrelacionPairOrder.ordenar(idOrigen, idCandidato);
        IncidenteCorrelacion existente = IncidenteCorrelacion.builder()
                .id(UUID.randomUUID())
                .incidenteAId(par.incidenteAId())
                .incidenteBId(par.incidenteBId())
                .score((short) 60)
                .estado(EstadoCorrelacion.PENDIENTE)
                .build();
        Map<String, Object> motivo = new LinkedHashMap<>(Map.of("score", 90));
        CorrelacionScorer.ResultadoPuntaje puntaje =
                new CorrelacionScorer.ResultadoPuntaje(90, 80.0, 5, motivo);

        when(incidenteRepository.findById(idOrigen)).thenReturn(Optional.of(origen));
        when(correlacionProperties.reglasPara("FORESTAL")).thenReturn(reglas);
        when(correlacionProperties.getUmbralScore()).thenReturn(60);
        when(incidenteRepository.findCandidatosCorrelacion(
                eq(idOrigen), anyList(), any(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(candidato));
        when(correlacionScorer.calcular(origen, candidato)).thenReturn(puntaje);
        when(correlacionRepository.findByIncidenteAIdAndIncidenteBId(par.incidenteAId(), par.incidenteBId()))
                .thenReturn(Optional.of(existente));
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        correlacionService.evaluarNuevoIncidente(idOrigen);

        assertEquals((short) 90, existente.getScore());
        verify(correlacionRepository).save(existente);
    }

    @Test
    void vincularManual_asignaCanonicoAlHijo() {
        UUID idHijo = UUID.randomUUID();
        Incidente hijo = Incidente.builder()
                .id(idHijo)
                .folio("REV-010")
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .build();
        VincularIncidenteRequest request = new VincularIncidenteRequest();
        request.setIncidenteCanonicoId(idA);

        when(incidenteRepository.findById(idHijo)).thenReturn(Optional.of(hijo));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var resumen = correlacionService.vincularManual(idHijo, request, "operador");

        assertEquals(idA, resumen.getIncidenteCanonicoId());
        assertEquals(idA, hijo.getIncidenteCanonicoId());
        verify(incidenteRepository).save(hijo);
    }

    @Test
    void listarPendientes_delegaAlRepositorio() {
        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        when(correlacionRepository.findByEstadoOrderByScoreDescCreatedAtDesc(EstadoCorrelacion.PENDIENTE))
                .thenReturn(List.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        var list = correlacionService.listarPendientes();

        assertEquals(1, list.size());
        assertEquals(EstadoCorrelacion.PENDIENTE, list.get(0).getEstado());
    }

    @Test
    void confirmar_sinCanonicoId_lanzaValidacion() {
        ConfirmarCorrelacionRequest request = new ConfirmarCorrelacionRequest();

        assertThrows(BusinessRuleException.class, () -> correlacionService.confirmar(correlacionId, request, "op"));
    }

    @Test
    void confirmar_canonicoInvalido_lanzaValidacion() {
        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        ConfirmarCorrelacionRequest request = new ConfirmarCorrelacionRequest();
        request.setIncidenteCanonicoId(UUID.randomUUID());

        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));

        assertThrows(BusinessRuleException.class, () -> correlacionService.confirmar(correlacionId, request, "op"));
    }

    @Test
    void evaluarNuevoIncidente_scoreBajo_noPersisteCorrelacion() {
        UUID idOrigen = UUID.randomUUID();
        UUID idCandidato = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.of(2026, 6, 29, 12, 0);

        Incidente origen = Incidente.builder()
                .id(idOrigen)
                .tipo("FORESTAL")
                .lat(-33.45)
                .lng(-70.66)
                .createdAt(now)
                .build();
        Incidente candidato = Incidente.builder()
                .id(idCandidato)
                .lat(-33.9)
                .lng(-71.0)
                .createdAt(now.plusMinutes(10))
                .build();

        CorrelacionProperties.ReglasTipo reglas = new CorrelacionProperties.ReglasTipo();
        reglas.setRadioMetros(500);
        reglas.setVentanaMinutos(90);
        Map<String, Object> motivo = new LinkedHashMap<>(Map.of("score", 30));
        CorrelacionScorer.ResultadoPuntaje puntaje =
                new CorrelacionScorer.ResultadoPuntaje(30, 5000.0, 10, motivo);

        when(incidenteRepository.findById(idOrigen)).thenReturn(Optional.of(origen));
        when(correlacionProperties.reglasPara("FORESTAL")).thenReturn(reglas);
        when(correlacionProperties.getUmbralScore()).thenReturn(60);
        when(incidenteRepository.findCandidatosCorrelacion(
                eq(idOrigen), anyList(), any(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(candidato));
        when(correlacionScorer.calcular(origen, candidato)).thenReturn(puntaje);

        correlacionService.evaluarNuevoIncidente(idOrigen);

        verify(correlacionRepository, never()).save(any());
    }

    @Test
    void vincularManual_mismoIncidente_lanzaValidacion() {
        VincularIncidenteRequest request = new VincularIncidenteRequest();
        request.setIncidenteCanonicoId(idA);

        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));

        assertThrows(BusinessRuleException.class, () -> correlacionService.vincularManual(idA, request, "op"));
    }

    @Test
    void vincularManual_destinoNoCanonico_lanzaValidacion() {
        UUID idHijo = UUID.randomUUID();
        Incidente hijo = Incidente.builder().id(idHijo).folio("REV-011").build();
        incidenteB.setIncidenteCanonicoId(idA);
        VincularIncidenteRequest request = new VincularIncidenteRequest();
        request.setIncidenteCanonicoId(idB);

        when(incidenteRepository.findById(idHijo)).thenReturn(Optional.of(hijo));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        assertThrows(BusinessRuleException.class, () -> correlacionService.vincularManual(idHijo, request, "op"));
    }

    @Test
    void resolveCanonicoId_devuelveIdDelIncidente() {
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));

        assertEquals(idA, correlacionService.resolveCanonicoId(idA));
    }

    @Test
    void resolveCanonicoId_devuelveCanonicoDelVinculado() {
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        assertEquals(idA, correlacionService.resolveCanonicoId(idB));
    }

    @Test
    void descartar_sinMotivo_marcaDescartada() {
        correlacion.setEstado(EstadoCorrelacion.PENDIENTE);
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));
        when(correlacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = correlacionService.descartar(correlacionId, null, "operador");

        assertEquals(EstadoCorrelacion.DESCARTADA, response.getEstado());
    }

    @Test
    void confirmar_yaResuelta_lanzaConflicto() {
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        ConfirmarCorrelacionRequest request = new ConfirmarCorrelacionRequest();
        request.setIncidenteCanonicoId(idA);

        assertThrows(BusinessRuleException.class, () -> correlacionService.confirmar(correlacionId, request, "op"));
    }

    @Test
    void reabrir_yaVinculados_lanzaConflicto() {
        correlacion.setEstado(EstadoCorrelacion.DESCARTADA);
        incidenteB.setIncidenteCanonicoId(idA);
        when(correlacionRepository.findById(correlacionId)).thenReturn(Optional.of(correlacion));
        when(incidenteRepository.findById(idA)).thenReturn(Optional.of(incidenteA));
        when(incidenteRepository.findById(idB)).thenReturn(Optional.of(incidenteB));

        assertThrows(BusinessRuleException.class, () -> correlacionService.reabrir(correlacionId, "op"));
    }

    @Test
    void evaluarNuevoIncidente_correlacionConfirmada_noRecrea() {
        UUID idOrigen = UUID.randomUUID();
        UUID idCandidato = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.of(2026, 6, 29, 12, 0);

        Incidente origen = Incidente.builder()
                .id(idOrigen)
                .tipo("FORESTAL")
                .lat(-33.45)
                .lng(-70.66)
                .createdAt(now)
                .build();
        Incidente candidato = Incidente.builder()
                .id(idCandidato)
                .lat(-33.451)
                .lng(-70.661)
                .createdAt(now.plusMinutes(5))
                .build();

        CorrelacionProperties.ReglasTipo reglas = new CorrelacionProperties.ReglasTipo();
        reglas.setRadioMetros(500);
        reglas.setVentanaMinutos(90);
        CorrelacionPairOrder.OrderedPair par = CorrelacionPairOrder.ordenar(idOrigen, idCandidato);
        IncidenteCorrelacion existente = IncidenteCorrelacion.builder()
                .incidenteAId(par.incidenteAId())
                .incidenteBId(par.incidenteBId())
                .estado(EstadoCorrelacion.CONFIRMADA)
                .build();
        Map<String, Object> motivo = new LinkedHashMap<>(Map.of("score", 85));
        CorrelacionScorer.ResultadoPuntaje puntaje =
                new CorrelacionScorer.ResultadoPuntaje(85, 120.0, 5, motivo);

        when(incidenteRepository.findById(idOrigen)).thenReturn(Optional.of(origen));
        when(correlacionProperties.reglasPara("FORESTAL")).thenReturn(reglas);
        when(correlacionProperties.getUmbralScore()).thenReturn(60);
        when(incidenteRepository.findCandidatosCorrelacion(
                eq(idOrigen), anyList(), any(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(candidato));
        when(correlacionScorer.calcular(origen, candidato)).thenReturn(puntaje);
        when(correlacionRepository.findByIncidenteAIdAndIncidenteBId(par.incidenteAId(), par.incidenteBId()))
                .thenReturn(Optional.of(existente));

        correlacionService.evaluarNuevoIncidente(idOrigen);

        verify(correlacionRepository, never()).save(any());
    }

    @Test
    void obtenerPorFolio_noExiste_lanzaNotFound() {
        when(incidenteRepository.findByFolio("REV-999")).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () -> correlacionService.obtenerPorFolio("REV-999"));
    }
}
