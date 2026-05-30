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
public class DashboardResponse {

    private IncidenteDto incidente;
    private ZonaRiesgoDto zonaRiesgo;
    private List<RecursoDto> recursos;
    private boolean degraded;
}
