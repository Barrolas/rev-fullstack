package cl.duocuc.rev.bff.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DespachoColaItemDto {
    private UUID incidenteId;
    private String folio;
    private String tipo;
    private String estado;
    private String descripcion;
    private Double lat;
    private Double lng;
    private String zonaNombre;
    private String zonaNivelRiesgo;
    private boolean conBrigadaAsignada;
    private int prioridad;
    private LocalDateTime createdAt;
}
