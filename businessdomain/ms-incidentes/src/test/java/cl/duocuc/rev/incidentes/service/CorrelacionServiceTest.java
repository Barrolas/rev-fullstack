package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.config.CorrelacionProperties;
import cl.duocuc.rev.incidentes.correlacion.CorrelacionScorer;
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
}
