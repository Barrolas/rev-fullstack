package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.client.ZonaRiesgoClientService;
import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.ZonaDto;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class OperacionesFacadeServiceTest {

    @Mock
    private IncidenteClientService incidenteClientService;

    @Mock
    private ZonaRiesgoClientService zonaRiesgoClientService;

    @Mock
    private RecursosClientService recursosClientService;

    @Mock
    private CorrelacionFacadeService correlacionFacadeService;

    @InjectMocks
    private OperacionesFacadeService operacionesFacadeService;

    @Test
    void crearIncidente_delegaAlCliente() {
        IncidenteCreateRequest request = new IncidenteCreateRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Incendio sector norte");
        request.setLat(-33.5);
        request.setLng(-70.5);

        IncidenteDto expected = IncidenteDto.builder()
                .id(UUID.randomUUID())
                .tipo("FORESTAL")
                .build();
        when(incidenteClientService.crear(any())).thenReturn(Mono.just(expected));

        IncidenteDto result = operacionesFacadeService.crearIncidente(request);

        assertEquals("FORESTAL", result.getTipo());
        verify(incidenteClientService).crear(request);
    }

    @Test
    void crearIncidente_sinTipo_lanzaExcepcion() {
        IncidenteCreateRequest request = new IncidenteCreateRequest();
        request.setDescripcion("Sin tipo");
        request.setLat(-33.5);
        request.setLng(-70.5);

        assertThrows(IllegalArgumentException.class, () -> operacionesFacadeService.crearIncidente(request));
    }

    @Test
    void crearZona_sinNombre_lanzaExcepcion() {
        ZonaDto request = ZonaDto.builder().centerLat(-33.4).centerLng(-70.5).radioMetros(500.0).build();

        assertThrows(IllegalArgumentException.class, () -> operacionesFacadeService.crearZona(request));
    }

    @Test
    void listarZonas_retornaListaDelCliente() {
        ZonaDto zona = ZonaDto.builder().id(1L).nombre("Test").nivelRiesgo("HIGH").build();
        when(zonaRiesgoClientService.listar(false)).thenReturn(Mono.just(List.of(zona)));

        List<ZonaDto> result = operacionesFacadeService.listarZonas();

        assertEquals(1, result.size());
        assertEquals("HIGH", result.get(0).getNivelRiesgo());
    }

    @Test
    void listarZonas_incluirInactivas_delegaAlCliente() {
        when(zonaRiesgoClientService.listar(true)).thenReturn(Mono.just(List.of()));

        assertTrue(operacionesFacadeService.listarZonas(true).isEmpty());
        verify(zonaRiesgoClientService).listar(true);
    }

    @Test
    void listarZonas_clienteNull_retornaVacio() {
        when(zonaRiesgoClientService.listar(false)).thenReturn(Mono.empty());

        assertTrue(operacionesFacadeService.listarZonas().isEmpty());
    }

    @Test
    void crearZona_ok_delegaAlCliente() {
        ZonaDto request = ZonaDto.builder()
                .nombre("Zona Centro")
                .centerLat(-33.4)
                .centerLng(-70.5)
                .radioMetros(800.0)
                .build();
        ZonaDto expected = ZonaDto.builder().id(3L).nombre("Zona Centro").build();
        when(zonaRiesgoClientService.crear(request)).thenReturn(Mono.just(expected));

        ZonaDto result = operacionesFacadeService.crearZona(request);

        assertEquals(3L, result.getId());
        verify(zonaRiesgoClientService).crear(request);
    }

    @Test
    void crearZona_sinCentro_lanzaExcepcion() {
        ZonaDto request = ZonaDto.builder().nombre("Incompleta").build();

        assertThrows(IllegalArgumentException.class, () -> operacionesFacadeService.crearZona(request));
    }

    @Test
    void actualizarZona_delegaAlCliente() {
        ZonaDto request = ZonaDto.builder().nombre("Actualizada").build();
        when(zonaRiesgoClientService.actualizar(5L, request)).thenReturn(Mono.just(request));

        assertEquals("Actualizada", operacionesFacadeService.actualizarZona(5L, request).getNombre());
    }

    @Test
    void desactivarZona_delegaAlCliente() {
        when(zonaRiesgoClientService.desactivar(7L)).thenReturn(Mono.empty());

        operacionesFacadeService.desactivarZona(7L);

        verify(zonaRiesgoClientService).desactivar(7L);
    }

    @Test
    void recalcularZonasIncidentes_delegaAlCliente() {
        when(incidenteClientService.recalcularZonas()).thenReturn(Mono.just(12));

        assertEquals(12, operacionesFacadeService.recalcularZonasIncidentes());
    }

    @Test
    void listarRecursosDisponibles_delegaAlCliente() {
        RecursosDisponiblesDto dto = RecursosDisponiblesDto.builder()
                .brigadas(List.of(RecursosDisponiblesDto.BrigadaItemDto.builder().id(1L).build()))
                .build();
        when(recursosClientService.listarDisponibles()).thenReturn(Mono.just(dto));

        assertEquals(1, operacionesFacadeService.listarRecursosDisponibles().getBrigadas().size());
    }

    @Test
    void listarRecursosDisponibles_clienteNull_retornaBuilderVacio() {
        when(recursosClientService.listarDisponibles()).thenReturn(Mono.empty());

        assertTrue(operacionesFacadeService.listarRecursosDisponibles().getBrigadas() == null
                || operacionesFacadeService.listarRecursosDisponibles().getBrigadas().isEmpty());
    }

    @Test
    void asignarRecurso_sinIds_lanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -> operacionesFacadeService.asignarRecurso(new AsignarRecursoRequest()));
    }

    @Test
    void asignarRecurso_resuelveCorrelacionYDelega() {
        UUID incidenteId = UUID.randomUUID();
        UUID idDespacho = UUID.randomUUID();
        AsignarRecursoRequest request = new AsignarRecursoRequest();
        request.setIncidenteId(incidenteId);
        request.setBrigadaId(4L);
        AsignacionDto asignacion = AsignacionDto.builder().id(20L).build();

        when(correlacionFacadeService.resolverIdDespacho(incidenteId)).thenReturn(idDespacho);
        when(recursosClientService.asignar(any())).thenReturn(Mono.just(asignacion));

        AsignacionDto result = operacionesFacadeService.asignarRecurso(request);

        assertEquals(20L, result.getId());
        assertEquals(idDespacho, request.getIncidenteId());
    }

    @Test
    void crearIncidente_sinDescripcion_lanzaExcepcion() {
        IncidenteCreateRequest request = new IncidenteCreateRequest();
        request.setTipo("FORESTAL");
        request.setLat(-33.5);
        request.setLng(-70.5);

        assertThrows(IllegalArgumentException.class, () -> operacionesFacadeService.crearIncidente(request));
    }
}
