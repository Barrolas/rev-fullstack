package cl.duocuc.rev.incidentes.dto;

import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IncidenteResponse {
    private UUID id;
    private String tipo;
    private EstadoIncidente estado;
    private Double lat;
    private Double lng;
    private String descripcion;
    private UUID reportanteUuid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
