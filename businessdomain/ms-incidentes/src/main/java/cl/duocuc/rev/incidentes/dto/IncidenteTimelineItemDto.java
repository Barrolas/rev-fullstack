package cl.duocuc.rev.incidentes.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IncidenteTimelineItemDto {
    private String tipo;
    private String estado;
    private String estadoAnterior;
    private LocalDateTime fechaHora;
    private String realizadoPor;
    private String origen;
}
