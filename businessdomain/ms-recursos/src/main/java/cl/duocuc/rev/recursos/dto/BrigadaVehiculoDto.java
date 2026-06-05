package cl.duocuc.rev.recursos.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadaVehiculoDto {
    private Long id;
    private Long vehiculoId;
    private String patente;
    private String tipo;
    private Integer capacidadPasajeros;
    private boolean principal;
    private boolean activa;
}
