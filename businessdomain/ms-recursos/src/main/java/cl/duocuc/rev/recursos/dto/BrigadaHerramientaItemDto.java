package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadaHerramientaItemDto {
    private Long herramientaId;
    private String nombre;
    private Integer cantidad;
}
