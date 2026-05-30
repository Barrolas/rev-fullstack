package cl.duocuc.rev.recursos.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class AsignarRequest {
    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
}
