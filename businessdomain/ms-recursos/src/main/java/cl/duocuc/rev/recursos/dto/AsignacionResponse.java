package cl.duocuc.rev.recursos.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AsignacionResponse {
    private Long id;
    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
    private boolean activa;
    private LocalDateTime createdAt;
}
