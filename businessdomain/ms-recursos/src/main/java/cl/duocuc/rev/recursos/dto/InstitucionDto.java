package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InstitucionDto {
    private Long id;
    private String codigo;
    private String nombre;
    private String estado;
}
