package cl.duocuc.rev.bff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadistaRolDto {
    private Long id;
    private String codigo;
    private String nombre;
    private Integer jerarquia;
    private String estado;
}
