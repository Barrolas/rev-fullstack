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
public class RevertirCorrelacionPreviewDto {
    private CorrelacionDto correlacion;
    private IncidenteResumenDto canonico;
    private IncidenteResumenDto reporteDesvinculado;
    private UUID incidenteDestinoSugerido;
    private boolean bloqueado;
    private List<AsignacionActivaDto> asignacionesActivas;
}
