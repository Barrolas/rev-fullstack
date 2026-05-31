package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class AsignarRecursoRequest {

    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
}
