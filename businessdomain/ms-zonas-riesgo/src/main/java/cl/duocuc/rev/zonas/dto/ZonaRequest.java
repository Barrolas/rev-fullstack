package cl.duocuc.rev.zonas.dto;

import lombok.Data;

@Data
public class ZonaRequest {

    private String nombre;
    private String nivelRiesgo;
    private Double centerLat;
    private Double centerLng;
    private Double radioMetros;
    private String comuna;
    private String tipo;
}
