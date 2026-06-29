package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.DespachoAsignarItemDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteRequest;
import cl.duocuc.rev.bff.dto.DespachoColaResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.ZonaRiesgoDto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class DespachoFacadeServiceTest {

    @Mock
    private DashboardFacadeService dashboardFacadeService;

    @Mock
    private RecursosClientService recursosClientService;

    @Mock
    private IncidenteClientService incidenteClientService;

    @InjectMocks
    private DespachoFacadeService despachoFacadeService;

    @Test
    void obtenerCola_incluyeIncidentesSinBrigada() {
        UUID id = UUID.randomUUID();
        IncidenteDto inc = IncidenteDto.builder()
                .id(id)
                .folio("REV-1")
                .tipo("FORESTAL")
                .estado("REPORTADO")
                .zonaNivelRiesgo("HIGH")
                .createdAt(LocalDateTime.now())
                .build();
        DashboardResponse dash = DashboardResponse.builder().incidente(inc).recursos(List.of()).build();
        RecursosDisponiblesDto.BrigadaItemDto brigada = RecursosDisponiblesDto.BrigadaItemDto.builder()
                .id(1L)
                .nombre("Brigada Norte")
                .estado("DISPONIBLE")
                .build();

        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of(dash));
        when(recursosClientService.listarDisponibles())
                .thenReturn(Mono.just(RecursosDisponiblesDto.builder().brigadas(List.of(brigada)).build()));
        when(recursosClientService.elegibilidadDespacho(1L)).thenReturn(Mono.empty());
        when(recursosClientService.obtenerBrigada(1L)).thenReturn(Mono.empty());

        DespachoColaResponse response = despachoFacadeService.obtenerCola();

        assertEquals(1, response.getCola().size());
        assertEquals(id, response.getCola().get(0).getIncidenteId());
        assertEquals(1, response.getBrigadasDisponibles().size());
        assertFalse(response.isRecursosDegraded());
    }

    @Test
    void obtenerCola_excluyeIncidentesConBrigadaAsignada() {
        UUID id = UUID.randomUUID();
        IncidenteDto inc = IncidenteDto.builder()
                .id(id)
                .estado("EN_PROGRESO")
                .build();
        RecursoDto brigada = RecursoDto.builder().tipo("BRIGADA").build();
        DashboardResponse dash = DashboardResponse.builder()
                .incidente(inc)
                .recursos(List.of(brigada))
                .build();

        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of(dash));
        when(recursosClientService.listarDisponibles()).thenReturn(Mono.just(RecursosDisponiblesDto.builder().build()));

        DespachoColaResponse response = despachoFacadeService.obtenerCola();

        assertTrue(response.getCola().isEmpty());
    }

    @Test
    void obtenerCola_fallaDashboard_retornaVacioDegradado() {
        when(dashboardFacadeService.listarDashboards()).thenThrow(new RuntimeException("MS caído"));

        DespachoColaResponse response = despachoFacadeService.obtenerCola();

        assertTrue(response.getCola().isEmpty());
        assertTrue(response.isRecursosDegraded());
    }

    @Test
    void listarActivos_delegaAlCliente() {
        AsignacionActivaDto activa = AsignacionActivaDto.builder().id(5L).build();
        when(recursosClientService.listarAsignacionesActivas()).thenReturn(Mono.just(List.of(activa)));

        List<AsignacionActivaDto> result = despachoFacadeService.listarActivos();

        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getId());
    }

    @Test
    void listarActivos_clienteNull_retornaVacio() {
        when(recursosClientService.listarAsignacionesActivas()).thenReturn(Mono.empty());

        assertTrue(despachoFacadeService.listarActivos().isEmpty());
    }

    @Test
    void actualizarEstadoAsignacion_delegaAlCliente() {
        ActualizarEstadoDespachoRequest request = new ActualizarEstadoDespachoRequest();
        request.setEstadoDespacho("EN_CAMINO");
        AsignacionActivaDto expected = AsignacionActivaDto.builder().id(3L).estadoDespacho("EN_CAMINO").build();
        when(recursosClientService.actualizarEstadoDespacho(3L, request)).thenReturn(Mono.just(expected));

        AsignacionActivaDto result = despachoFacadeService.actualizarEstadoAsignacion(3L, request);

        assertEquals("EN_CAMINO", result.getEstadoDespacho());
    }

    @Test
    void listarAsignacionesIncidente_delegaAlCliente() {
        UUID incidenteId = UUID.randomUUID();
        when(recursosClientService.listarAsignacionesPorIncidente(incidenteId)).thenReturn(Mono.just(List.of()));

        assertTrue(despachoFacadeService.listarAsignacionesIncidente(incidenteId).isEmpty());
        verify(recursosClientService).listarAsignacionesPorIncidente(incidenteId);
    }

    @Test
    void liberarAsignacionesIncidente_delegaAlCliente() {
        UUID incidenteId = UUID.randomUUID();
        when(recursosClientService.liberarPorIncidente(incidenteId)).thenReturn(Mono.empty());

        despachoFacadeService.liberarAsignacionesIncidente(incidenteId);

        verify(recursosClientService).liberarPorIncidente(incidenteId);
    }

    @Test
    void cerrarIncidente_desdeReportado_transicionaHastaCerrado() {
        UUID incidenteId = UUID.randomUUID();
        IncidenteDto reportado = IncidenteDto.builder().id(incidenteId).estado("REPORTADO").build();
        IncidenteDto cerrado = IncidenteDto.builder().id(incidenteId).estado("CERRADO").folio("REV-99").build();

        when(incidenteClientService.obtenerPorId(incidenteId)).thenReturn(Mono.just(reportado));
        when(recursosClientService.liberarPorIncidente(incidenteId)).thenReturn(Mono.empty());
        when(incidenteClientService.transicionar(incidenteId, "EN_PROGRESO")).thenReturn(Mono.just(reportado));
        when(incidenteClientService.transicionar(incidenteId, "CONTROLADO")).thenReturn(Mono.just(reportado));
        when(incidenteClientService.transicionar(incidenteId, "CERRADO")).thenReturn(Mono.just(cerrado));

        IncidenteDto result = despachoFacadeService.cerrarIncidente(incidenteId);

        assertEquals("CERRADO", result.getEstado());
        verify(incidenteClientService).transicionar(incidenteId, "EN_PROGRESO");
        verify(incidenteClientService).transicionar(incidenteId, "CONTROLADO");
        verify(incidenteClientService).transicionar(incidenteId, "CERRADO");
    }

    @Test
    void cerrarIncidente_noEncontrado_lanzaExcepcion() {
        UUID incidenteId = UUID.randomUUID();
        when(incidenteClientService.obtenerPorId(incidenteId)).thenReturn(Mono.empty());

        assertThrows(IllegalArgumentException.class, () -> despachoFacadeService.cerrarIncidente(incidenteId));
    }

    @Test
    void asignarLote_sinItems_lanzaExcepcion() {
        DespachoAsignarLoteRequest request = DespachoAsignarLoteRequest.builder()
                .incidenteId(UUID.randomUUID())
                .items(List.of())
                .build();

        assertThrows(IllegalArgumentException.class, () -> despachoFacadeService.asignarLote(request));
    }

    @Test
    void asignarLote_itemSinBrigada_cuentaFallido() {
        DespachoAsignarLoteRequest request = DespachoAsignarLoteRequest.builder()
                .incidenteId(UUID.randomUUID())
                .items(List.of(DespachoAsignarItemDto.builder().build()))
                .build();

        var response = despachoFacadeService.asignarLote(request);

        assertEquals(0, response.getExitosos());
        assertEquals(1, response.getFallidos());
    }

    @Test
    void asignarLote_exitoso_delegaAsignacion() {
        UUID incidenteId = UUID.randomUUID();
        DespachoAsignarLoteRequest request = DespachoAsignarLoteRequest.builder()
                .incidenteId(incidenteId)
                .despachadoPor("desp1")
                .items(List.of(DespachoAsignarItemDto.builder().brigadaId(2L).build()))
                .build();
        AsignacionDto asignacion = AsignacionDto.builder().id(10L).build();
        when(recursosClientService.asignar(any())).thenReturn(Mono.just(asignacion));

        var response = despachoFacadeService.asignarLote(request);

        assertEquals(1, response.getExitosos());
        assertEquals(0, response.getFallidos());
        assertTrue(response.getResultados().get(0).isOk());
        verify(recursosClientService).asignar(any());
    }

    @Test
    void asignarLote_errorAsignacion_cuentaFallido() {
        DespachoAsignarLoteRequest request = DespachoAsignarLoteRequest.builder()
                .incidenteId(UUID.randomUUID())
                .items(List.of(DespachoAsignarItemDto.builder().brigadaId(2L).build()))
                .build();
        when(recursosClientService.asignar(any())).thenThrow(new RuntimeException("Brigada ocupada"));

        var response = despachoFacadeService.asignarLote(request);

        assertEquals(0, response.getExitosos());
        assertEquals(1, response.getFallidos());
        assertFalse(response.getResultados().get(0).isOk());
    }

    @Test
    void obtenerCola_dashboardDegradado_marcaDegraded() {
        IncidenteDto inc = IncidenteDto.builder()
                .id(UUID.randomUUID())
                .estado("REPORTADO")
                .createdAt(LocalDateTime.now())
                .build();
        DashboardResponse dash = DashboardResponse.builder().incidente(inc).degraded(true).recursos(List.of()).build();

        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of(dash));
        when(recursosClientService.listarDisponibles()).thenReturn(Mono.just(RecursosDisponiblesDto.builder().build()));

        DespachoColaResponse response = despachoFacadeService.obtenerCola();

        assertTrue(response.isRecursosDegraded());
    }

    @Test
    void obtenerCola_sinBrigadasDisponibles_marcaDegraded() {
        IncidenteDto inc = IncidenteDto.builder()
                .id(UUID.randomUUID())
                .estado("ESCALADO")
                .zonaNivelRiesgo("MEDIUM")
                .createdAt(LocalDateTime.now())
                .build();
        DashboardResponse dash = DashboardResponse.builder().incidente(inc).recursos(List.of()).build();

        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of(dash));
        when(recursosClientService.listarDisponibles()).thenReturn(Mono.just(RecursosDisponiblesDto.builder().build()));

        DespachoColaResponse response = despachoFacadeService.obtenerCola();

        assertEquals(1, response.getCola().size());
        assertTrue(response.isRecursosDegraded());
    }

    @Test
    void obtenerCola_usaNivelRiesgoDeDashboard() {
        IncidenteDto inc = IncidenteDto.builder()
                .id(UUID.randomUUID())
                .estado("REPORTADO")
                .createdAt(LocalDateTime.now())
                .build();
        ZonaRiesgoDto zona = ZonaRiesgoDto.builder().nivel("HIGH").build();
        DashboardResponse dash = DashboardResponse.builder()
                .incidente(inc)
                .zonaRiesgo(zona)
                .recursos(List.of())
                .build();

        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of(dash));
        when(recursosClientService.listarDisponibles())
                .thenReturn(Mono.just(RecursosDisponiblesDto.builder()
                        .brigadas(List.of(RecursosDisponiblesDto.BrigadaItemDto.builder().id(1L).build()))
                        .build()));
        when(recursosClientService.elegibilidadDespacho(1L)).thenReturn(Mono.empty());
        when(recursosClientService.obtenerBrigada(1L)).thenReturn(Mono.empty());

        DespachoColaResponse response = despachoFacadeService.obtenerCola();

        assertEquals("HIGH", response.getCola().get(0).getZonaNivelRiesgo());
    }

    @Test
    void cerrarIncidente_desdeEnProgreso_saltaReportado() {
        UUID incidenteId = UUID.randomUUID();
        IncidenteDto enProgreso = IncidenteDto.builder().id(incidenteId).estado("EN_PROGRESO").build();
        IncidenteDto cerrado = IncidenteDto.builder().id(incidenteId).estado("CERRADO").build();

        when(incidenteClientService.obtenerPorId(incidenteId)).thenReturn(Mono.just(enProgreso));
        when(recursosClientService.liberarPorIncidente(incidenteId)).thenReturn(Mono.empty());
        when(incidenteClientService.transicionar(incidenteId, "CONTROLADO")).thenReturn(Mono.just(enProgreso));
        when(incidenteClientService.transicionar(incidenteId, "CERRADO")).thenReturn(Mono.just(cerrado));

        IncidenteDto result = despachoFacadeService.cerrarIncidente(incidenteId);

        assertEquals("CERRADO", result.getEstado());
        verify(incidenteClientService, never()).transicionar(incidenteId, "EN_PROGRESO");
    }

    @Test
    void cerrarIncidente_estadoInvalido_lanzaExcepcion() {
        UUID incidenteId = UUID.randomUUID();
        IncidenteDto incidente = IncidenteDto.builder().id(incidenteId).estado("DESCONOCIDO").build();

        when(incidenteClientService.obtenerPorId(incidenteId)).thenReturn(Mono.just(incidente));
        when(recursosClientService.liberarPorIncidente(incidenteId)).thenReturn(Mono.empty());

        assertThrows(IllegalStateException.class, () -> despachoFacadeService.cerrarIncidente(incidenteId));
    }

    @Test
    void cerrarIncidente_yaCerrado_noTransiciona() {
        UUID incidenteId = UUID.randomUUID();
        IncidenteDto cerrado = IncidenteDto.builder().id(incidenteId).estado("CERRADO").folio("REV-1").build();

        when(incidenteClientService.obtenerPorId(incidenteId)).thenReturn(Mono.just(cerrado));
        when(recursosClientService.liberarPorIncidente(incidenteId)).thenReturn(Mono.empty());

        IncidenteDto result = despachoFacadeService.cerrarIncidente(incidenteId);

        assertEquals("CERRADO", result.getEstado());
        verify(incidenteClientService, never()).transicionar(eq(incidenteId), any());
    }

    @Test
    void listarAsignacionesIncidente_clienteNull_retornaVacio() {
        UUID incidenteId = UUID.randomUUID();
        when(recursosClientService.listarAsignacionesPorIncidente(incidenteId)).thenReturn(Mono.empty());

        assertTrue(despachoFacadeService.listarAsignacionesIncidente(incidenteId).isEmpty());
    }
}
