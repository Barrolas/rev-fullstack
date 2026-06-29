package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import cl.duocuc.rev.incidentes.repository.TransicionEstadoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class IncidenteServiceIntegrationTest {

    @Autowired
    private IncidenteService incidenteService;

    @Autowired
    private IncidenteRepository incidenteRepository;

    @Autowired
    private TransicionEstadoRepository transicionEstadoRepository;

    @MockitoBean
    private ZonaAsignacionService zonaAsignacionService;

    @MockitoBean
    private FolioService folioService;

    @MockitoBean
    private CorrelacionService correlacionService;

    @Test
    void crearTransicionarYTimeline() {
        when(folioService.nextFolio()).thenReturn("REV-2026-00099");
        IncidenteRequest request = new IncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Integración EVA3");
        request.setLat(-33.45);
        request.setLng(-70.66);

        var creado = incidenteService.crear(request);
        assertNotNull(creado.getFolio());
        assertEquals(EstadoIncidente.REPORTADO, creado.getEstado());

        var transicionado = incidenteService.transicionar(
                creado.getId(), EstadoIncidente.EN_PROGRESO, "despachador", "TEST");
        assertEquals(EstadoIncidente.EN_PROGRESO, transicionado.getEstado());

        var timeline = incidenteService.timeline(creado.getId());
        assertEquals(2, timeline.size());
        assertEquals(1, transicionEstadoRepository.findByIncidenteIdOrderByCreatedAtAsc(creado.getId()).size());
        assertEquals(1, incidenteRepository.count());
    }
}
