package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadistaRolDto {
    private Long id;
    private String codigo;
    private String nombre;
    private Integer jerarquia;
    private String estado;
}
