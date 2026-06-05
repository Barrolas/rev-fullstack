package cl.duocuc.rev.bff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadaVehiculoDto {
    private Long id;
    private Long vehiculoId;
    private String patente;
    private String tipo;
    private Integer capacidadPasajeros;
    private boolean principal;
    private boolean activa;
}
