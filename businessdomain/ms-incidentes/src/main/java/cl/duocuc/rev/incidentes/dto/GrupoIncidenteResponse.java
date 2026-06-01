package cl.duocuc.rev.incidentes.dto;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GrupoIncidenteResponse {
    private UUID incidenteCanonicoId;
    private String folioCanonico;
    private IncidenteResumen canonico;
    private List<IncidenteResumen> vinculados;
    private List<CorrelacionResponse> sugerenciasPendientes;
}
