package cl.duocuc.rev.bff.dto;

import java.time.LocalDateTime;
import java.util.List;
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
    private String folio;
    private String tipo;
    private String estado;
    private Double lat;
    private Double lng;
    private String direccionReferencia;
    private String descripcion;
    private boolean anonimo;
    private String reportanteNombre;
    private String reportanteApellido;
    private String reportanteRut;
    private String reportanteContacto;
    private String origenReporte;
    private UUID reportanteUuid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AdjuntoDto> adjuntos;
}
