package cl.duocuc.rev.zonas.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeatherDataDto {
    private double temperaturaC;
    private int humedadPct;
    private double vientoKmh;
    private String descripcion;
    private String fuente;
}
