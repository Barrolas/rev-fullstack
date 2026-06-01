package cl.duocuc.rev.recursos.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class AsignarRequest {
    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
    /** Si true (default), aplica vehículo, brigadistas y herramientas definidos en la brigada. */
    private Boolean usarComposicionBrigada;
}
