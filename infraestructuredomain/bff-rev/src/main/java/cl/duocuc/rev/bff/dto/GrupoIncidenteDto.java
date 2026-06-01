package cl.duocuc.rev.bff.dto;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoIncidenteDto {
    private UUID incidenteCanonicoId;
    private String folioCanonico;
    private IncidenteResumenDto canonico;
    private List<IncidenteResumenDto> vinculados;
    private List<CorrelacionDto> sugerenciasPendientes;
}
