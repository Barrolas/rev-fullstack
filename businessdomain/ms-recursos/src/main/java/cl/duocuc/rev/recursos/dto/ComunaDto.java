package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ComunaDto {
    private Integer codigoCasen;
    private String nombre;
    private Integer codigoProvinciaCasen;
}
