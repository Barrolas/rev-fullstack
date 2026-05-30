package cl.duocuc.rev.zonas.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiesgoZonaResponse {
    private Long zonaId;
    private String nombreZona;
    private String nivelRiesgo;
    private Double lat;
    private Double lng;
    private double temperaturaC;
    private int humedadPct;
    private double vientoKmh;
    private String condicionClimatica;
    private String fuenteClima;
}
