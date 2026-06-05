package cl.duocuc.rev.recursos.dto;

import lombok.Data;

@Data
public class VehiculoRequest {

    private String patente;
    private String tipo;
    private String marca;
    private String modelo;
    private Short anio;
    private Integer capacidadPasajeros;
    private Integer capacidadCarga;
}
