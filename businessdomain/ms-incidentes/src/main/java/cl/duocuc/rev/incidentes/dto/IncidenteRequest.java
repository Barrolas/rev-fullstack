package cl.duocuc.rev.incidentes.dto;

import lombok.Data;

@Data
public class IncidenteRequest {
    private String tipo;
    private String descripcion;
    private Double lat;
    private Double lng;
    private String direccionReferencia;
}
