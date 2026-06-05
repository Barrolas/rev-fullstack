package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HerramientaDto {
    private Long id;
    private String nombre;
    private Integer cantidadTotal;
    private Integer cantidadDisponible;
    private String marca;
    private String modelo;
    private String sku;
    private String estado;
}
