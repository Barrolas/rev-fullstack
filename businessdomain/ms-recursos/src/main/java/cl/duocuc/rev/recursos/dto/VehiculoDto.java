package cl.duocuc.rev.recursos.dto;

import cl.duocuc.rev.recursos.model.EstadoRecurso;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehiculoDto {
    private Long id;
    private String patente;
    private String tipo;
    private String marca;
    private String modelo;
    private Short anio;
    private Integer capacidadPasajeros;
    private Integer capacidadCarga;
    private EstadoRecurso estado;
}
