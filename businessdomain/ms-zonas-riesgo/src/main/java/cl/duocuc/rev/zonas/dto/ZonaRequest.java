package cl.duocuc.rev.zonas.dto;

import lombok.Data;

@Data
public class ZonaRequest {

    private String nombre;
    private String nivelRiesgo;
    private Double minLat;
    private Double maxLat;
    private Double minLng;
    private Double maxLng;
}
