package cl.duocuc.rev.bff.dto;

import lombok.Data;

@Data
public class HerramientaCreateRequest {
    private String nombre;
    private Integer cantidadTotal;
    private String marca;
    private String modelo;
    private String sku;
    private String estado;
}
