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
public class IncidenteDto {

    private UUID id;
    private String tipo;
    private String estado;
    private Double lat;
    private Double lng;
    private String descripcion;
    private UUID reportanteUuid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
