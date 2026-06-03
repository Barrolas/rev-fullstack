package cl.duocuc.rev.bff.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapaTerritorialResponse {

    private int radioCorrelacionMetros;
    private List<ZonaDto> zonas;
    private List<MapaIncidentePuntoDto> incidentes;
    private int incidentesSinUbicacion;
}
