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
    private String codigo;
    private Long idCompania;
    private Long idJefeBrigadista;
    /** Vehículo principal activo de la dotación (compatibilidad). */
    private Long vehiculoId;
}
