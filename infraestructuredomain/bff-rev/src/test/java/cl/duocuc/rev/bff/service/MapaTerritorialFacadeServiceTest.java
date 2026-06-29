package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.config.MapaTerritorialProperties;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.MapaTerritorialResponse;
import cl.duocuc.rev.bff.dto.ZonaDto;
import cl.duocuc.rev.bff.dto.ZonaRiesgoDto;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MapaTerritorialFacadeServiceTest {

    @Mock
    private DashboardFacadeService dashboardFacadeService;

    @Mock
    private OperacionesFacadeService operacionesFacadeService;

    @Mock
    private MapaTerritorialProperties mapaProperties;

    @InjectMocks
    private MapaTerritorialFacadeService mapaTerritorialFacadeService;

    @Test
    void obtenerMapaTerritorial_agrupaIncidentesConUbicacion() {
        UUID canonicoId = UUID.randomUUID();
        UUID vinculadoId = UUID.randomUUID();
        IncidenteDto lider = IncidenteDto.builder()
                .id(canonicoId)
                .folio("REV-1")
                .tipo("FORESTAL")
                .estado("REPORTADO")
                .lat(-33.4)
                .lng(-70.5)
                .esCanonico(true)
                .build();
        IncidenteDto vinculado = IncidenteDto.builder()
                .id(vinculadoId)
                .folio("REV-2")
                .tipo("FORESTAL")
                .estado("REPORTADO")
                .lat(-33.41)
                .lng(-70.51)
                .incidenteCanonicoId(canonicoId)
                .sugerenciasPendientes(2L)
                .build();
        IncidenteDto sinUbicacion = IncidenteDto.builder()
                .id(UUID.randomUUID())
                .folio("REV-3")
                .estado("REPORTADO")
                .build();

        when(mapaProperties.getRadioCorrelacionMetros()).thenReturn(500);
        when(operacionesFacadeService.listarZonas())
                .thenReturn(List.of(ZonaDto.builder().id(1L).nombre("Sector Norte").build()));
        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of(
                DashboardResponse.builder()
                        .incidente(lider)
                        .zonaRiesgo(ZonaRiesgoDto.builder().nivel("HIGH").nombreZona("Zona A").build())
                        .build(),
                DashboardResponse.builder()
                        .incidente(vinculado)
                        .zonaRiesgo(ZonaRiesgoDto.builder().nivel("HIGH").build())
                        .build(),
                DashboardResponse.builder().incidente(sinUbicacion).build()));

        MapaTerritorialResponse mapa = mapaTerritorialFacadeService.obtenerMapaTerritorial();

        assertEquals(500, mapa.getRadioCorrelacionMetros());
        assertEquals(1, mapa.getZonas().size());
        assertEquals(1, mapa.getIncidentes().size());
        assertEquals(1, mapa.getIncidentesSinUbicacion());
        assertEquals(2, mapa.getIncidentes().get(0).getReportesEnGrupo());
        assertTrue(mapa.getIncidentes().get(0).isTieneGrupoConfirmado());
        assertEquals(2L, mapa.getIncidentes().get(0).getSugerenciasPendientes());
    }

    @Test
    void obtenerMapaTerritorial_sinIncidentes_retornaVacio() {
        when(mapaProperties.getRadioCorrelacionMetros()).thenReturn(500);
        when(operacionesFacadeService.listarZonas()).thenReturn(List.of());
        when(dashboardFacadeService.listarDashboards()).thenReturn(List.of());

        MapaTerritorialResponse mapa = mapaTerritorialFacadeService.obtenerMapaTerritorial();

        assertTrue(mapa.getIncidentes().isEmpty());
        assertEquals(0, mapa.getIncidentesSinUbicacion());
    }
}
