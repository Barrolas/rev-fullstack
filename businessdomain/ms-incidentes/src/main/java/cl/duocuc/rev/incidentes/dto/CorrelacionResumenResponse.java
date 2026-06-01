package cl.duocuc.rev.incidentes.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CorrelacionResumenResponse {
    private UUID incidenteId;
    private UUID incidenteCanonicoId;
    private String folioCanonico;
    private boolean esCanonico;
    private long cantidadReportesVinculados;
    private long sugerenciasPendientes;
    private short scoreMaximoPendiente;
}
