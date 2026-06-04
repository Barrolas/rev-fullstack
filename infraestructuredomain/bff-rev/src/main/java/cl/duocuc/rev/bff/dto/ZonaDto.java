package cl.duocuc.rev.bff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaDto {

    private Long id;
    private String nombre;
    private String nivelRiesgo;
    private Double minLat;
    private Double maxLat;
    private Double minLng;
    private Double maxLng;
    private Double centerLat;
    private Double centerLng;
    private Double radioMetros;
    private String comuna;
    private String tipo;
    private Boolean activa;
}
