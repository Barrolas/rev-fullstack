package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.KeycloakRegisterClient;
import cl.duocuc.rev.bff.client.RecursosClientService;
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
import cl.duocuc.rev.bff.dto.RegisterCiudadanoResponse;
import cl.duocuc.rev.bff.dto.VehiculoCreateRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class RecursosFacadeServiceTest {

    @Mock
    private RecursosClientService recursosClientService;

    @Mock
    private CorrelacionFacadeService correlacionFacadeService;

    @Mock
    private KeycloakRegisterClient keycloakRegisterClient;

    @InjectMocks
    private RecursosFacadeService recursosFacadeService;

    @Test
    void listarInstituciones_delegaAlCliente() {
        InstitucionDto inst = InstitucionDto.builder().id(1L).nombre("Bomberos").build();
        when(recursosClientService.listarInstituciones()).thenReturn(Mono.just(List.of(inst)));

        List<InstitucionDto> result = recursosFacadeService.listarInstituciones();

        assertEquals(1, result.size());
        assertEquals("Bomberos", result.get(0).getNombre());
    }

    @Test
    void listarInstituciones_clienteNull_retornaVacio() {
        when(recursosClientService.listarInstituciones()).thenReturn(Mono.empty());

        assertTrue(recursosFacadeService.listarInstituciones().isEmpty());
    }

    @Test
    void listarCompanias_delegaAlCliente() {
        CompaniaDto comp = CompaniaDto.builder().id(2L).nombre("Compania Sur").build();
        when(recursosClientService.listarCompanias()).thenReturn(Mono.just(List.of(comp)));

        assertEquals("Compania Sur", recursosFacadeService.listarCompanias().get(0).getNombre());
    }

    @Test
    void listarCatalogo_clienteNull_retornaBuilderVacio() {
        when(recursosClientService.listarCatalogo()).thenReturn(Mono.empty());

        RecursosCatalogoDto catalogo = recursosFacadeService.listarCatalogo();

        assertTrue(catalogo.getBrigadas() == null || catalogo.getBrigadas().isEmpty());
    }

    @Test
    void listarDisponibles_delegaAlCliente() {
        RecursosDisponiblesDto dto = RecursosDisponiblesDto.builder()
                .brigadas(List.of(RecursosDisponiblesDto.BrigadaItemDto.builder().id(1L).nombre("BN").build()))
                .build();
        when(recursosClientService.listarDisponibles()).thenReturn(Mono.just(dto));

        assertEquals(1, recursosFacadeService.listarDisponibles().getBrigadas().size());
    }

    @Test
    void crearBrigada_delegaAlCliente() {
        BrigadaCreateRequest request = new BrigadaCreateRequest();
        request.setNombre("Brigada Test");
        RecursosDisponiblesDto.BrigadaItemDto expected = RecursosDisponiblesDto.BrigadaItemDto.builder()
                .id(5L)
                .nombre("Brigada Test")
                .build();
        when(recursosClientService.crearBrigada(request)).thenReturn(Mono.just(expected));

        assertEquals(5L, recursosFacadeService.crearBrigada(request).getId());
    }

    @Test
    void crearBrigadista_registraEnKeycloakYDelega() {
        BrigadistaCreateRequest request = new BrigadistaCreateRequest();
        request.setNombre("Ana");
        request.setApellido("Lopez");
        UUID kcSub = UUID.randomUUID();
        RegisterCiudadanoResponse kcResponse = RegisterCiudadanoResponse.builder().userId(kcSub).build();
        RecursosCatalogoDto.BrigadistaItemDto brigadista = RecursosCatalogoDto.BrigadistaItemDto.builder()
                .id(10L)
                .nombre("Ana")
                .build();

        when(keycloakRegisterClient.registrarBrigadista(any())).thenReturn(Mono.just(kcResponse));
        when(recursosClientService.crearBrigadista(any())).thenReturn(Mono.just(brigadista));

        RecursosCatalogoDto.BrigadistaItemDto result = recursosFacadeService.crearBrigadista(request);

        assertEquals(10L, result.getId());
        assertEquals("ana.lopez", request.getKeycloakUsername());
        assertEquals(kcSub, request.getKeycloakSub());
        verify(keycloakRegisterClient).registrarBrigadista(any());
    }

    @Test
    void asignarRecurso_sinIds_lanzaExcepcion() {
        AsignarRecursoRequest request = new AsignarRecursoRequest();

        assertThrows(IllegalArgumentException.class, () -> recursosFacadeService.asignarRecurso(request));
    }

    @Test
    void asignarRecurso_resuelveCorrelacionYDelega() {
        UUID incidenteId = UUID.randomUUID();
        UUID idDespacho = UUID.randomUUID();
        AsignarRecursoRequest request = new AsignarRecursoRequest();
        request.setIncidenteId(incidenteId);
        request.setBrigadaId(2L);
        AsignacionDto asignacion = AsignacionDto.builder().id(99L).build();

        when(correlacionFacadeService.resolverIdDespacho(incidenteId)).thenReturn(idDespacho);
        when(recursosClientService.asignar(any())).thenReturn(Mono.just(asignacion));

        AsignacionDto result = recursosFacadeService.asignarRecurso(request);

        assertEquals(99L, result.getId());
        assertEquals(idDespacho, request.getIncidenteId());
        verify(correlacionFacadeService).resolverIdDespacho(incidenteId);
    }

    @Test
    void desasignar_delegaAlCliente() {
        when(recursosClientService.desasignar(7L)).thenReturn(Mono.empty());

        recursosFacadeService.desasignar(7L);

        verify(recursosClientService).desasignar(7L);
    }

    @Test
    void listarComunas_delegaAlCliente() {
        ComunaDto comuna = ComunaDto.builder().nombre("Valle").build();
        when(recursosClientService.listarComunas()).thenReturn(Mono.just(List.of(comuna)));

        assertEquals("Valle", recursosFacadeService.listarComunas().get(0).getNombre());
    }

    @Test
    void listarComunas_clienteNull_retornaVacio() {
        when(recursosClientService.listarComunas()).thenReturn(Mono.empty());

        assertTrue(recursosFacadeService.listarComunas().isEmpty());
    }

    @Test
    void listarBrigadistaRoles_delegaAlCliente() {
        BrigadistaRolDto rol = BrigadistaRolDto.builder().codigo("JEFE").nombre("Jefe").build();
        when(recursosClientService.listarBrigadistaRoles()).thenReturn(Mono.just(List.of(rol)));

        assertEquals("JEFE", recursosFacadeService.listarBrigadistaRoles().get(0).getCodigo());
    }

    @Test
    void elegibilidadDespacho_delegaAlCliente() {
        BrigadaElegibilidadDto elegibilidad = BrigadaElegibilidadDto.builder()
                .listaParaDespacho(true)
                .build();
        when(recursosClientService.elegibilidadDespacho(3L)).thenReturn(Mono.just(elegibilidad));

        assertTrue(recursosFacadeService.elegibilidadDespacho(3L).isListaParaDespacho());
    }

    @Test
    void actualizarVehiculosBrigada_delegaAlCliente() {
        BrigadaVehiculosRequest request = new BrigadaVehiculosRequest();
        BrigadaVehiculoDto vehiculo = BrigadaVehiculoDto.builder().vehiculoId(1L).build();
        when(recursosClientService.actualizarVehiculosBrigada(2L, request)).thenReturn(Mono.just(List.of(vehiculo)));

        assertEquals(1, recursosFacadeService.actualizarVehiculosBrigada(2L, request).size());
    }

    @Test
    void obtenerBrigada_delegaAlCliente() {
        BrigadaDetalleDto detalle = BrigadaDetalleDto.builder().id(4L).nombre("Brigada Test").build();
        when(recursosClientService.obtenerBrigada(4L)).thenReturn(Mono.just(detalle));

        assertEquals("Brigada Test", recursosFacadeService.obtenerBrigada(4L).getNombre());
    }

    @Test
    void actualizarComposicion_delegaAlCliente() {
        BrigadaComposicionRequest request = new BrigadaComposicionRequest();
        BrigadaDetalleDto detalle = BrigadaDetalleDto.builder().id(4L).nombre("Actualizada").build();
        when(recursosClientService.actualizarComposicion(4L, request)).thenReturn(Mono.just(detalle));

        assertEquals("Actualizada", recursosFacadeService.actualizarComposicion(4L, request).getNombre());
    }

    @Test
    void crearVehiculo_delegaAlCliente() {
        VehiculoCreateRequest request = new VehiculoCreateRequest();
        request.setPatente("ABCD12");
        RecursosDisponiblesDto.VehiculoItemDto vehiculo = RecursosDisponiblesDto.VehiculoItemDto.builder()
                .id(8L)
                .patente("ABCD12")
                .build();
        when(recursosClientService.crearVehiculo(request)).thenReturn(Mono.just(vehiculo));

        assertEquals("ABCD12", recursosFacadeService.crearVehiculo(request).getPatente());
    }

    @Test
    void crearHerramienta_delegaAlCliente() {
        HerramientaCreateRequest request = new HerramientaCreateRequest();
        request.setNombre("Motosierra");
        RecursosDisponiblesDto.HerramientaItemDto herramienta = RecursosDisponiblesDto.HerramientaItemDto.builder()
                .id(9L)
                .nombre("Motosierra")
                .build();
        when(recursosClientService.crearHerramienta(request)).thenReturn(Mono.just(herramienta));

        assertEquals("Motosierra", recursosFacadeService.crearHerramienta(request).getNombre());
    }

    @Test
    void crearBrigadista_conUsernameExplicito_noGeneraUsername() {
        BrigadistaCreateRequest request = new BrigadistaCreateRequest();
        request.setKeycloakUsername("brig.explicito");
        request.setNombre("Pedro");
        request.setApellido("Soto");
        request.setEmail("pedro@test.cl");
        request.setPassword("secret123");
        RecursosCatalogoDto.BrigadistaItemDto brigadista = RecursosCatalogoDto.BrigadistaItemDto.builder()
                .id(11L)
                .build();

        when(keycloakRegisterClient.registrarBrigadista(any())).thenReturn(Mono.just(RegisterCiudadanoResponse.builder().build()));
        when(recursosClientService.crearBrigadista(any())).thenReturn(Mono.just(brigadista));

        RecursosCatalogoDto.BrigadistaItemDto result = recursosFacadeService.crearBrigadista(request);

        assertEquals(11L, result.getId());
        assertEquals("brig.explicito", request.getKeycloakUsername());
        assertEquals("pedro@test.cl", request.getEmail());
    }
}
