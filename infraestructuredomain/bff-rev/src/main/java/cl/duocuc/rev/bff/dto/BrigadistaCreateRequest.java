package cl.duocuc.rev.bff.dto;

import lombok.Data;

@Data
public class BrigadistaCreateRequest {
    private String nombre;
    private String apellido;
    private String rut;
    private String especialidad;
}
