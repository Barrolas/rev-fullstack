package cl.duocuc.rev.recursos.dto;

import cl.duocuc.rev.recursos.model.EstadoRecurso;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadaDto {
    private Long id;
    private String nombre;
    private Integer capacidad;
    private EstadoRecurso estado;
}
