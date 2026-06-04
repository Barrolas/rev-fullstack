package cl.duocuc.rev.incidentes.dto;

import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IncidenteResponse {
    private UUID id;
    private String folio;
    private String tipo;
    private EstadoIncidente estado;
    private Double lat;
    private Double lng;
    private String direccionReferencia;
    private String descripcion;
    private boolean anonimo;
    private String reportanteNombre;
    private String reportanteApellido;
    private String reportanteRut;
    private String reportanteContacto;
    private OrigenReporte origenReporte;
    private UUID reportanteUuid;
    private Long zonaId;
    private String zonaNombre;
    private String zonaNivelRiesgo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AdjuntoResponse> adjuntos;
}
