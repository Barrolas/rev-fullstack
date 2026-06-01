package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrelacionResumenDto {
    private UUID incidenteId;
    private UUID incidenteCanonicoId;
    private String folioCanonico;
    private boolean esCanonico;
    private long cantidadReportesVinculados;
    private long sugerenciasPendientes;
    private short scoreMaximoPendiente;
}
