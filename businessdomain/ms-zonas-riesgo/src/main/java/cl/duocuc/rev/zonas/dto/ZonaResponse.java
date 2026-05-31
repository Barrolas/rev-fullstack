package cl.duocuc.rev.zonas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaResponse {

    private Long id;
    private String nombre;
    private String nivelRiesgo;
    private Double minLat;
    private Double maxLat;
    private Double minLng;
    private Double maxLng;
}
