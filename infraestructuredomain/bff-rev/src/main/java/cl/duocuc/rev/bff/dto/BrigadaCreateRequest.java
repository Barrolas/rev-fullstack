package cl.duocuc.rev.bff.dto;

import lombok.Data;

@Data
public class BrigadaCreateRequest {
    private String nombre;
    private Integer capacidad;
    private String codigo;
    private Long idCompania;
}
