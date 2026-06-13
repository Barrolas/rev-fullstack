package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.CorrelacionClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.CorrelacionDto;
import cl.duocuc.rev.bff.dto.IncidenteResumenDto;
import cl.duocuc.rev.bff.dto.RevertirCorrelacionRequest;
import cl.duocuc.rev.bff.exception.CorrelacionBloqueadaException;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class CorrelacionFacadeServiceTest {

    @Mock
    private CorrelacionClientService correlacionClientService;

    @Mock
    private RecursosClientService recursosClientService;

    @InjectMocks
    private CorrelacionFacadeService correlacionFacadeService;

    @Test
    void previewRevertir_marcaBloqueadoConAsignacionesActivas() {
        UUID correlacionId = UUID.randomUUID();
        UUID canonicoId = UUID.randomUUID();
        UUID vinculadoId = UUID.randomUUID();

        CorrelacionDto correlacion = CorrelacionDto.builder()
                .id(correlacionId)
                .estado("CONFIRMADA")
                .incidenteCanonicoId(canonicoId)
                .incidenteA(IncidenteResumenDto.builder().id(canonicoId).folio("REV-001").build())
                .incidenteB(IncidenteResumenDto.builder().id(vinculadoId).folio("REV-002").build())
                .build();

        when(correlacionClientService.obtener(correlacionId)).thenReturn(Mono.just(correlacion));
        when(recursosClientService.listarAsignacionesPorIncidente(canonicoId))
                .thenReturn(Mono.just(List.of(AsignacionActivaDto.builder()
                        .id(10L)
                        .brigadaNombre("Brigada Norte")
                        .estadoDespacho("EN_CAMINO")
                        .build())));

        var preview = correlacionFacadeService.previewRevertir(correlacionId);

        assertTrue(preview.isBloqueado());
        assertEquals(vinculadoId, preview.getIncidenteDestinoSugerido());
        assertEquals(1, preview.getAsignacionesActivas().size());
    }

    @Test
    void revertir_sinReasignacion_lanzaSiHayDespachoActivo() {
        UUID correlacionId = UUID.randomUUID();
        UUID canonicoId = UUID.randomUUID();
        UUID vinculadoId = UUID.randomUUID();

        CorrelacionDto correlacion = CorrelacionDto.builder()
                .id(correlacionId)
                .estado("CONFIRMADA")
                .incidenteCanonicoId(canonicoId)
                .incidenteA(IncidenteResumenDto.builder().id(canonicoId).folio("REV-001").build())
                .incidenteB(IncidenteResumenDto.builder().id(vinculadoId).folio("REV-002").build())
                .build();

        when(correlacionClientService.obtener(correlacionId)).thenReturn(Mono.just(correlacion));
        when(recursosClientService.listarAsignacionesPorIncidente(canonicoId))
                .thenReturn(Mono.just(List.of(AsignacionActivaDto.builder().id(1L).build())));

        assertThrows(
                CorrelacionBloqueadaException.class,
                () -> correlacionFacadeService.revertir(correlacionId, null, "op"));
        verify(correlacionClientService, never()).revertir(any(), any());
    }

    @Test
    void revertir_conReasignacion_transfiereYRevertir() {
        UUID correlacionId = UUID.randomUUID();
        UUID canonicoId = UUID.randomUUID();
        UUID vinculadoId = UUID.randomUUID();

        CorrelacionDto correlacion = CorrelacionDto.builder()
                .id(correlacionId)
                .estado("CONFIRMADA")
                .incidenteCanonicoId(canonicoId)
                .incidenteA(IncidenteResumenDto.builder().id(canonicoId).folio("REV-001").build())
                .incidenteB(IncidenteResumenDto.builder().id(vinculadoId).folio("REV-002").build())
                .build();

        when(correlacionClientService.obtener(correlacionId)).thenReturn(Mono.just(correlacion));
        when(recursosClientService.listarAsignacionesPorIncidente(canonicoId))
                .thenReturn(Mono.just(List.of(AsignacionActivaDto.builder().id(5L).build())));
        when(recursosClientService.transferirIncidente(any())).thenReturn(Mono.just(List.of()));
        when(correlacionClientService.revertir(correlacionId, "op")).thenReturn(Mono.just(correlacion));

        RevertirCorrelacionRequest request = new RevertirCorrelacionRequest();
        request.setReasignarAsignacionesA(vinculadoId);

        correlacionFacadeService.revertir(correlacionId, request, "op");

        verify(recursosClientService).transferirIncidente(any());
        verify(correlacionClientService).revertir(correlacionId, "op");
    }
}
