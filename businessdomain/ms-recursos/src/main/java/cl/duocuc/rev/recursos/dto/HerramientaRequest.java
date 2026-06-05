package cl.duocuc.rev.recursos.dto;

import lombok.Data;

@Data
public class HerramientaRequest {

    private String nombre;
    private Integer cantidadTotal;
    private String marca;
    private String modelo;
    private String sku;
    private String estado;
}
