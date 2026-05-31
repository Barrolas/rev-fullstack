package cl.duocuc.rev.bff.dto;

import lombok.Data;

@Data
public class IncidenteCreateRequest {

    private String tipo;
    private String descripcion;
    private Double lat;
    private Double lng;
}
