package cl.duocuc.rev.incidentes.dto;

import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IncidenteResumen {
    private UUID id;
    private String folio;
    private String tipo;
    private EstadoIncidente estado;
    private Double lat;
    private Double lng;
    private String descripcion;
    private OrigenReporte origenReporte;
    private UUID incidenteCanonicoId;
    private LocalDateTime createdAt;
}
