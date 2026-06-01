package cl.duocuc.rev.incidentes.dto;

import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CorrelacionResponse {
    private UUID id;
    private IncidenteResumen incidenteA;
    private IncidenteResumen incidenteB;
    private short score;
    private double distanciaMetros;
    private int deltaMinutos;
    private Map<String, Object> motivo;
    private EstadoCorrelacion estado;
    private UUID incidenteCanonicoId;
    private String decididoPor;
    private LocalDateTime decididoAt;
    private LocalDateTime createdAt;
}
