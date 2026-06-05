package cl.duocuc.rev.bff.dto;

import lombok.Data;

@Data
public class VehiculoCreateRequest {
    private String patente;
    private String tipo;
    private String marca;
    private String modelo;
    private Short anio;
    private Integer capacidadPasajeros;
    private Integer capacidadCarga;
}
