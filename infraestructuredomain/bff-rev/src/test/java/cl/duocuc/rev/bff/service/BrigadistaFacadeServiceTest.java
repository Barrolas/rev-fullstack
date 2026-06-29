package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadistaOperativoDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.TransicionIncidenteRequest;
import cl.duocuc.rev.bff.security.AuthorizationException;
import cl.duocuc.rev.bff.security.AuthorizationService;
import cl.duocuc.rev.bff.security.RevAuthContext;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class BrigadistaFacadeServiceTest {

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private RecursosClientService recursosClientService;

    @Mock
    private IncidenteClientService incidenteClientService;

    @Mock
    private DashboardFacadeService dashboardFacadeService;

    @InjectMocks
    private BrigadistaFacadeService brigadistaFacadeService;

    private final RevAuthContext auth = RevAuthContext.builder()
            .username("brig1")
            .roles(List.of("Brigadista"))
            .build();

    private final BrigadistaOperativoDto perfil = BrigadistaOperativoDto.builder()
            .brigadistaId(10L)
            .brigadaId(2L)
            .esJefe(true)
            .username("brig1")
            .build();

    @Test
    void misAsignaciones_delegaPorBrigada() {
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        AsignacionActivaDto activa = AsignacionActivaDto.builder().id(1L).brigadaId(2L).build();
        when(recursosClientService.listarAsignacionesPorBrigada(2L)).thenReturn(Mono.just(List.of(activa)));

        List<AsignacionActivaDto> result = brigadistaFacadeService.misAsignaciones(auth);

        assertEquals(1, result.size());
        verify(recursosClientService).listarAsignacionesPorBrigada(2L);
    }

    @Test
    void miBrigada_delegaAlCliente() {
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        BrigadaDetalleDto detalle = BrigadaDetalleDto.builder().id(2L).nombre("Brigada Norte").build();
        when(recursosClientService.obtenerBrigada(2L)).thenReturn(Mono.just(detalle));

        BrigadaDetalleDto result = brigadistaFacadeService.miBrigada(auth);

        assertEquals("Brigada Norte", result.getNombre());
    }

    @Test
    void incidenteAsignado_validaAccesoYDelega() {
        UUID incidenteId = UUID.randomUUID();
        DashboardResponse dash = DashboardResponse.builder()
                .incidente(IncidenteDto.builder().id(incidenteId).folio("REV-1").build())
                .build();
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        when(dashboardFacadeService.obtenerPorIncidenteId(incidenteId)).thenReturn(dash);

        DashboardResponse result = brigadistaFacadeService.incidenteAsignado(auth, incidenteId);

        assertEquals("REV-1", result.getIncidente().getFolio());
        verify(authorizationService).requireAccesoIncidenteBrigada(perfil, incidenteId);
    }

    @Test
    void avanzarEstadoDespacho_brigadaDistinta_lanzaForbidden() {
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        AsignacionActivaDto asignacion = AsignacionActivaDto.builder().id(5L).brigadaId(99L).build();
        when(recursosClientService.obtenerAsignacionActiva(5L)).thenReturn(Mono.just(asignacion));

        assertThrows(AuthorizationException.class, () -> brigadistaFacadeService.avanzarEstadoDespacho(
                auth, 5L, new ActualizarEstadoDespachoRequest()));
    }

    @Test
    void avanzarEstadoDespacho_jefe_ok() {
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        ActualizarEstadoDespachoRequest request = new ActualizarEstadoDespachoRequest();
        request.setEstadoDespacho("EN_SITIO");
        AsignacionActivaDto asignacion = AsignacionActivaDto.builder().id(5L).brigadaId(2L).build();
        AsignacionActivaDto actualizada = AsignacionActivaDto.builder()
                .id(5L)
                .brigadaId(2L)
                .estadoDespacho("EN_SITIO")
                .build();
        when(recursosClientService.obtenerAsignacionActiva(5L)).thenReturn(Mono.just(asignacion));
        when(recursosClientService.actualizarEstadoDespacho(5L, request)).thenReturn(Mono.just(actualizada));

        AsignacionActivaDto result = brigadistaFacadeService.avanzarEstadoDespacho(auth, 5L, request);

        assertEquals("EN_SITIO", result.getEstadoDespacho());
        verify(authorizationService).requireJefe(perfil);
    }

    @Test
    void transicionarIncidente_estadoNoPermitido_lanzaForbidden() {
        UUID incidenteId = UUID.randomUUID();
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        TransicionIncidenteRequest request = new TransicionIncidenteRequest();
        request.setEstadoDestino("CERRADO");

        assertThrows(AuthorizationException.class, () -> brigadistaFacadeService.transicionarIncidente(
                auth, incidenteId, request));
    }

    @Test
    void transicionarIncidente_jefe_delegaAlCliente() {
        UUID incidenteId = UUID.randomUUID();
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        TransicionIncidenteRequest request = new TransicionIncidenteRequest();
        request.setEstadoDestino("EN_PROGRESO");
        IncidenteDto incidente = IncidenteDto.builder().id(incidenteId).estado("EN_PROGRESO").build();
        when(incidenteClientService.transicionarConAuditoria(
                eq(incidenteId), eq("EN_PROGRESO"), eq("brig1"), eq("JEFE_BRIGADA")))
                .thenReturn(Mono.just(incidente));

        IncidenteDto result = brigadistaFacadeService.transicionarIncidente(auth, incidenteId, request);

        assertEquals("EN_PROGRESO", result.getEstado());
        verify(authorizationService).requireAccesoIncidenteBrigada(perfil, incidenteId);
    }

    @Test
    void transicionarIncidente_controlado_delegaAlCliente() {
        UUID incidenteId = UUID.randomUUID();
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        TransicionIncidenteRequest request = new TransicionIncidenteRequest();
        request.setEstadoDestino("CONTROLADO");
        IncidenteDto incidente = IncidenteDto.builder().id(incidenteId).estado("CONTROLADO").build();
        when(incidenteClientService.transicionarConAuditoria(
                eq(incidenteId), eq("CONTROLADO"), eq("brig1"), eq("JEFE_BRIGADA")))
                .thenReturn(Mono.just(incidente));

        IncidenteDto result = brigadistaFacadeService.transicionarIncidente(auth, incidenteId, request);

        assertEquals("CONTROLADO", result.getEstado());
    }

    @Test
    void avanzarEstadoDespacho_asignacionNull_lanzaForbidden() {
        when(authorizationService.requireBrigadista(auth)).thenReturn(perfil);
        when(recursosClientService.obtenerAsignacionActiva(5L)).thenReturn(Mono.empty());

        assertThrows(AuthorizationException.class, () -> brigadistaFacadeService.avanzarEstadoDespacho(
                auth, 5L, new ActualizarEstadoDespachoRequest()));
    }

    @Test
    void avanzarEstadoDespacho_noJefe_lanzaForbidden() {
        BrigadistaOperativoDto noJefe = BrigadistaOperativoDto.builder()
                .brigadistaId(10L)
                .brigadaId(2L)
                .esJefe(false)
                .build();
        when(authorizationService.requireBrigadista(auth)).thenReturn(noJefe);
        org.mockito.Mockito.doThrow(new AuthorizationException("Solo el jefe", org.springframework.http.HttpStatus.FORBIDDEN))
                .when(authorizationService).requireJefe(noJefe);

        assertThrows(AuthorizationException.class, () -> brigadistaFacadeService.avanzarEstadoDespacho(
                auth, 5L, new ActualizarEstadoDespachoRequest()));
    }
}
