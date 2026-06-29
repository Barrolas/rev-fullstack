package cl.duocuc.rev.bff.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.BrigadistaOperativoDto;
import cl.duocuc.rev.bff.dto.PerfilOperativoDto;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private RecursosClientService recursosClientService;

    @InjectMocks
    private AuthorizationService authorizationService;

    @Test
    void requireOperador_sinRol_lanzaForbidden() {
        RevAuthContext auth = RevAuthContext.builder()
                .username("ciudadano")
                .roles(List.of("Ciudadano"))
                .build();

        assertThrows(AuthorizationException.class, () -> authorizationService.requireOperador(auth));
    }

    @Test
    void requireOperador_despachador_ok() {
        RevAuthContext auth = RevAuthContext.builder()
                .username("despachador")
                .roles(List.of("Despachador"))
                .build();

        authorizationService.requireOperador(auth);
    }

    @Test
    void requireOperador_authNull_lanzaForbidden() {
        AuthorizationException ex = assertThrows(
                AuthorizationException.class, () -> authorizationService.requireOperador(null));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void requireBrigadista_authNull_lanzaForbidden() {
        assertThrows(AuthorizationException.class, () -> authorizationService.requireBrigadista(null));
    }

    @Test
    void requireBrigadista_conBrigada_retornaOperativo() {
        UUID sub = UUID.randomUUID();
        RevAuthContext auth = RevAuthContext.builder()
                .sub(sub.toString())
                .username("brig1")
                .roles(List.of("Brigadista"))
                .build();
        RecursosCatalogoDto.BrigadistaItemDto brigadista = RecursosCatalogoDto.BrigadistaItemDto.builder()
                .id(10L)
                .idBrigada(2L)
                .rolCodigo("MIEMBRO")
                .esJefe(false)
                .build();
        RecursosDisponiblesDto.BrigadaItemDto brigada = RecursosDisponiblesDto.BrigadaItemDto.builder()
                .id(2L)
                .nombre("Brigada Sur")
                .codigo("BS-01")
                .build();

        when(recursosClientService.obtenerBrigadistaPorSub(sub)).thenReturn(Mono.just(brigadista));
        when(recursosClientService.obtenerBrigadaResumen(2L)).thenReturn(brigada);

        BrigadistaOperativoDto perfil = authorizationService.requireBrigadista(auth);

        assertEquals(10L, perfil.getBrigadistaId());
        assertEquals(2L, perfil.getBrigadaId());
        assertEquals("Brigada Sur", perfil.getBrigadaNombre());
        assertEquals("brig1", perfil.getUsername());
        assertFalse(perfil.isEsJefe());
    }

    @Test
    void requireBrigadista_sinBrigada_lanzaForbidden() {
        UUID sub = UUID.randomUUID();
        RevAuthContext auth = RevAuthContext.builder()
                .sub(sub.toString())
                .username("brig1")
                .roles(List.of("Brigadista"))
                .build();
        RecursosCatalogoDto.BrigadistaItemDto brigadista = RecursosCatalogoDto.BrigadistaItemDto.builder()
                .id(10L)
                .idBrigada(null)
                .build();

        when(recursosClientService.obtenerBrigadistaPorSub(sub)).thenReturn(Mono.just(brigadista));

        AuthorizationException ex = assertThrows(
                AuthorizationException.class, () -> authorizationService.requireBrigadista(auth));

        assertEquals("El brigadista no pertenece a ninguna brigada activa", ex.getMessage());
    }

    @Test
    void requireJefe_jefe_ok() {
        BrigadistaOperativoDto perfil = BrigadistaOperativoDto.builder().esJefe(true).build();

        authorizationService.requireJefe(perfil);
    }

    @Test
    void requireJefe_noJefe_lanzaForbidden() {
        BrigadistaOperativoDto perfil = BrigadistaOperativoDto.builder().esJefe(false).build();

        assertThrows(AuthorizationException.class, () -> authorizationService.requireJefe(perfil));
    }

    @Test
    void requireJefe_perfilNull_lanzaForbidden() {
        assertThrows(AuthorizationException.class, () -> authorizationService.requireJefe(null));
    }

    @Test
    void requireAccesoIncidenteBrigada_asignada_ok() {
        UUID incidenteId = UUID.randomUUID();
        BrigadistaOperativoDto perfil = BrigadistaOperativoDto.builder().brigadaId(2L).build();

        when(recursosClientService.brigadaAsignadaAIncidente(2L, incidenteId)).thenReturn(true);

        authorizationService.requireAccesoIncidenteBrigada(perfil, incidenteId);

        verify(recursosClientService).brigadaAsignadaAIncidente(2L, incidenteId);
    }

    @Test
    void requireAccesoIncidenteBrigada_sinAsignacion_lanzaForbidden() {
        UUID incidenteId = UUID.randomUUID();
        BrigadistaOperativoDto perfil = BrigadistaOperativoDto.builder().brigadaId(2L).build();

        when(recursosClientService.brigadaAsignadaAIncidente(2L, incidenteId)).thenReturn(false);

        assertThrows(
                AuthorizationException.class,
                () -> authorizationService.requireAccesoIncidenteBrigada(perfil, incidenteId));
    }

    @Test
    void resolverPerfil_operador_retornaPerfilBasico() {
        RevAuthContext auth = RevAuthContext.builder()
                .username("admin1")
                .roles(List.of("Admin"))
                .build();

        PerfilOperativoDto perfil = authorizationService.resolverPerfil(auth);

        assertTrue(perfil.isOperador());
        assertEquals("admin1", perfil.getUsername());
    }

    @Test
    void resolverPerfil_ciudadano_lanzaForbidden() {
        RevAuthContext auth = RevAuthContext.builder()
                .username("ciudadano")
                .roles(List.of("Ciudadano"))
                .build();

        AuthorizationException ex = assertThrows(
                AuthorizationException.class, () -> authorizationService.resolverPerfil(auth));

        assertEquals("Perfil no autorizado", ex.getMessage());
    }

    @Test
    void resolverPerfil_brigadistaSinVinculo_lanzaForbidden() {
        RevAuthContext auth = RevAuthContext.builder()
                .username("brig1")
                .roles(List.of("Brigadista"))
                .build();

        when(recursosClientService.obtenerBrigadistaPorUsername("brig1"))
                .thenReturn(Mono.error(new RuntimeException("no encontrado")));

        AuthorizationException ex = assertThrows(
                AuthorizationException.class, () -> authorizationService.resolverPerfil(auth));

        assertEquals("Cuenta Brigadista sin vínculo operativo en ms-recursos", ex.getMessage());
    }

    @Test
    void resolverBrigadista_subInvalido_usaUsernameFallback() {
        RevAuthContext auth = RevAuthContext.builder()
                .sub("no-es-uuid")
                .username("brig1")
                .roles(List.of("Brigadista"))
                .build();
        RecursosCatalogoDto.BrigadistaItemDto brigadista = RecursosCatalogoDto.BrigadistaItemDto.builder()
                .id(10L)
                .idBrigada(2L)
                .rolCodigo("JEFE")
                .esJefe(true)
                .nombre("Ana")
                .apellido("Lopez")
                .build();
        RecursosDisponiblesDto.BrigadaItemDto brigada = RecursosDisponiblesDto.BrigadaItemDto.builder()
                .id(2L)
                .nombre("Brigada Norte")
                .codigo("BN-01")
                .build();

        when(recursosClientService.obtenerBrigadistaPorUsername("brig1")).thenReturn(Mono.just(brigadista));
        when(recursosClientService.obtenerBrigadaResumen(2L)).thenReturn(brigada);

        PerfilOperativoDto perfil = authorizationService.resolverPerfil(auth);

        assertEquals(10L, perfil.getBrigadistaId());
        verify(recursosClientService).obtenerBrigadistaPorUsername("brig1");
    }

    @Test
    void resolverPerfil_brigadistaConBrigada_retornaDatosOperativos() {
        UUID sub = UUID.randomUUID();
        RevAuthContext auth = RevAuthContext.builder()
                .sub(sub.toString())
                .username("brig1")
                .roles(List.of("Brigadista"))
                .build();
        RecursosCatalogoDto.BrigadistaItemDto brigadista = RecursosCatalogoDto.BrigadistaItemDto.builder()
                .id(10L)
                .idBrigada(2L)
                .rolCodigo("JEFE")
                .esJefe(true)
                .nombre("Ana")
                .apellido("Lopez")
                .build();
        RecursosDisponiblesDto.BrigadaItemDto brigada = RecursosDisponiblesDto.BrigadaItemDto.builder()
                .id(2L)
                .nombre("Brigada Norte")
                .codigo("BN-01")
                .build();

        when(recursosClientService.obtenerBrigadistaPorSub(sub)).thenReturn(Mono.just(brigadista));
        when(recursosClientService.obtenerBrigadaResumen(2L)).thenReturn(brigada);

        PerfilOperativoDto perfil = authorizationService.resolverPerfil(auth);

        assertEquals(10L, perfil.getBrigadistaId());
        assertEquals(2L, perfil.getBrigadaId());
        assertTrue(perfil.isEsJefe());
        assertTrue(perfil.isPuedeTransicionarIncidente());
    }
}
