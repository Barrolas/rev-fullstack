package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.cache.ZonaRiesgoCache;
import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.client.ZonaRiesgoClientService;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursoDto;
import cl.duocuc.rev.bff.security.AuthorizationService;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class DashboardFacadeServiceTest {

    @Mock
    private IncidenteClientService incidenteClientService;

    @Mock
    private ZonaRiesgoClientService zonaRiesgoClientService;

    @Mock
    private RecursosClientService recursosClientService;

    @Mock
    private CorrelacionFacadeService correlacionFacadeService;

    @Mock
    private ZonaRiesgoCache zonaRiesgoCache;

    @Mock
    private AuthorizationService authorizationService;

    @Spy
    @InjectMocks
    private DashboardFacadeService dashboardFacadeService;

    @BeforeEach
    void setUp() {
        dashboardFacadeService.setSelf(dashboardFacadeService);
    }

    @Test
    void listarDashboards_sinIncidentes_retornaVacio() {
        when(incidenteClientService.listar()).thenReturn(Mono.just(Collections.emptyList()));

        var dashboards = dashboardFacadeService.listarDashboards();

        assertTrue(dashboards.isEmpty());
    }

    @Test
    void obtenerPorIncidenteId_retornaDashboardEnriquecido() {
        UUID id = UUID.randomUUID();
        IncidenteDto incidente = IncidenteDto.builder()
                .id(id)
                .folio("REV-10")
                .tipo("FORESTAL")
                .estado("REPORTADO")
                .zonaNivelRiesgo("HIGH")
                .zonaNombre("Sector Norte")
                .lat(-33.4)
                .lng(-70.5)
                .build();
        when(incidenteClientService.obtenerPorId(id)).thenReturn(Mono.just(incidente));
        when(correlacionFacadeService.cargarResumenes(List.of(id))).thenReturn(Map.of());
        doNothing().when(correlacionFacadeService).enriquecerIncidente(any(), any());
        when(recursosClientService.listarPorIncidente(id))
                .thenReturn(Mono.just(List.of(RecursoDto.builder().tipo("BRIGADA").build())));

        var dashboard = dashboardFacadeService.obtenerPorIncidenteId(id);

        assertEquals("REV-10", dashboard.getIncidente().getFolio());
        assertEquals("HIGH", dashboard.getZonaRiesgo().getNivel());
        assertEquals(1, dashboard.getRecursos().size());
        assertEquals("BRIGADA", dashboard.getRecursos().get(0).getTipo());
    }
}
