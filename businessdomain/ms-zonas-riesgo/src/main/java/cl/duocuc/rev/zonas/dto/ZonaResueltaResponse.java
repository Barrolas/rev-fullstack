package cl.duocuc.rev.zonas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaResueltaResponse {

    private Long zonaId;
    private String nombre;
    private String nivelRiesgo;
    private String comuna;
    private String tipo;
    private Double distanciaMetros;
}
