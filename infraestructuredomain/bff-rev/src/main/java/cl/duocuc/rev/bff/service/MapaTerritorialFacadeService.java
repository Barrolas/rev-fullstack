package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.config.MapaTerritorialProperties;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.MapaIncidentePuntoDto;
import cl.duocuc.rev.bff.dto.MapaTerritorialResponse;
import cl.duocuc.rev.bff.dto.ZonaDto;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MapaTerritorialFacadeService {

    private final DashboardFacadeService dashboardFacadeService;
    private final OperacionesFacadeService operacionesFacadeService;
    private final MapaTerritorialProperties mapaProperties;

    public MapaTerritorialResponse obtenerMapaTerritorial() {
        List<ZonaDto> zonas = operacionesFacadeService.listarZonas();
        List<DashboardResponse> dashboards = dashboardFacadeService.listarDashboards();

        Map<UUID, List<DashboardResponse>> porGrupo = new HashMap<>();
        int sinUbicacion = 0;

        for (DashboardResponse dash : dashboards) {
            IncidenteDto inc = dash.getIncidente();
            if (inc.getLat() == null || inc.getLng() == null) {
                sinUbicacion++;
                continue;
            }
            UUID grupoId = inc.getIncidenteCanonicoId() != null ? inc.getIncidenteCanonicoId() : inc.getId();
            porGrupo.computeIfAbsent(grupoId, k -> new ArrayList<>()).add(dash);
        }

        List<MapaIncidentePuntoDto> puntos = new ArrayList<>();
        for (Map.Entry<UUID, List<DashboardResponse>> entry : porGrupo.entrySet()) {
            UUID grupoId = entry.getKey();
            List<DashboardResponse> miembros = entry.getValue();
            DashboardResponse lider = miembros.stream()
                    .filter(d -> grupoId.equals(d.getIncidente().getId()))
                    .findFirst()
                    .orElse(miembros.get(0));
            IncidenteDto inc = lider.getIncidente();
            boolean grupoConfirmado = miembros.stream()
                    .anyMatch(d -> d.getIncidente().getIncidenteCanonicoId() != null);
            long sugerencias = miembros.stream()
                    .mapToLong(d -> d.getIncidente().getSugerenciasPendientes() != null
                            ? d.getIncidente().getSugerenciasPendientes()
                            : 0L)
                    .sum();

            puntos.add(MapaIncidentePuntoDto.builder()
                    .id(inc.getId())
                    .grupoId(grupoId)
                    .folio(inc.getFolio())
                    .tipo(inc.getTipo())
                    .estado(inc.getEstado())
                    .lat(inc.getLat())
                    .lng(inc.getLng())
                    .direccionReferencia(inc.getDireccionReferencia())
                    .origenReporte(inc.getOrigenReporte())
                    .nivelRiesgoZona(lider.getZonaRiesgo() != null ? lider.getZonaRiesgo().getNivel() : "DESCONOCIDO")
                    .zonaNombre(inc.getZonaNombre() != null
                            ? inc.getZonaNombre()
                            : (lider.getZonaRiesgo() != null ? lider.getZonaRiesgo().getNombreZona() : null))
                    .esCanonico(Boolean.TRUE.equals(inc.getEsCanonico()) || inc.getIncidenteCanonicoId() == null)
                    .reportesEnGrupo(miembros.size())
                    .sugerenciasPendientes(sugerencias)
                    .tieneGrupoConfirmado(grupoConfirmado && miembros.size() > 1)
                    .build());
        }

        return MapaTerritorialResponse.builder()
                .radioCorrelacionMetros(mapaProperties.getRadioCorrelacionMetros())
                .zonas(zonas)
                .incidentes(puntos)
                .incidentesSinUbicacion(sinUbicacion)
                .build();
    }
}
