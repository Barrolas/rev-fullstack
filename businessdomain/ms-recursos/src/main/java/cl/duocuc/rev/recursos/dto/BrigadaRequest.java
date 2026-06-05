package cl.duocuc.rev.recursos.dto;

import lombok.Data;

@Data
public class BrigadaRequest {

    private String nombre;
    private Integer capacidad;
    private String codigo;
    private Long idCompania;
}
