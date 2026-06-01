package cl.duocuc.rev.bff.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrelacionDto {
    private UUID id;
    private IncidenteResumenDto incidenteA;
    private IncidenteResumenDto incidenteB;
    private short score;
    private double distanciaMetros;
    private int deltaMinutos;
    private Map<String, Object> motivo;
    private String estado;
    private UUID incidenteCanonicoId;
    private String decididoPor;
    private LocalDateTime decididoAt;
    private LocalDateTime createdAt;
}
