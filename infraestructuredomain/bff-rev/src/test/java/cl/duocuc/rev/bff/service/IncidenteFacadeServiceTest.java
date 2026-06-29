package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.dto.IncidenteTimelineItemDto;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class IncidenteFacadeServiceTest {

    @Mock
    private IncidenteClientService incidenteClientService;

    @InjectMocks
    private IncidenteFacadeService incidenteFacadeService;

    @Test
    void timeline_delegaAlCliente() {
        UUID incidenteId = UUID.randomUUID();
        IncidenteTimelineItemDto item = IncidenteTimelineItemDto.builder()
                .tipo("TRANSICION")
                .estado("EN_PROGRESO")
                .build();
        when(incidenteClientService.timeline(incidenteId)).thenReturn(Mono.just(List.of(item)));

        List<IncidenteTimelineItemDto> result = incidenteFacadeService.timeline(incidenteId);

        assertEquals(1, result.size());
        assertEquals("TRANSICION", result.get(0).getTipo());
        verify(incidenteClientService).timeline(incidenteId);
    }

    @Test
    void timeline_clienteNull_retornaNull() {
        UUID incidenteId = UUID.randomUUID();
        when(incidenteClientService.timeline(incidenteId)).thenReturn(Mono.empty());

        assertNull(incidenteFacadeService.timeline(incidenteId));
    }
}
