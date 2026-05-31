package cl.duocuc.rev.bff.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionDto {

    private Long id;
    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
    private boolean activa;
    private LocalDateTime createdAt;
}
