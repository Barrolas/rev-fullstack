package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompaniaDto {
    private Long id;
    private Long idInstitucion;
    private Integer idComuna;
    private String nombreComuna;
    private String codigo;
    private String nombre;
    private String estado;
}
