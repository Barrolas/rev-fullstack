package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.client.ZonaRiesgoClientService;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
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
    void listarZonas_retornaListaDelCliente() {
        ZonaDto zona = ZonaDto.builder().id(1L).nombre("Test").nivelRiesgo("HIGH").build();
        when(zonaRiesgoClientService.listar()).thenReturn(Mono.just(List.of(zona)));

        List<ZonaDto> result = operacionesFacadeService.listarZonas();

        assertEquals(1, result.size());
        assertEquals("HIGH", result.get(0).getNivelRiesgo());
    }
}
