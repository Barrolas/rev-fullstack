package cl.duocuc.rev.recursos.dto;

import cl.duocuc.rev.recursos.model.EstadoRecurso;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadaDetalleDto {
    private Long id;
    private String nombre;
    private Integer capacidad;
    private EstadoRecurso estado;
    private Long vehiculoId;
    private VehiculoDto vehiculo;
    private List<BrigadaVehiculoDto> vehiculos;
    private Long idJefeBrigadista;
    private BrigadistaDto jefe;
    private List<BrigadistaDto> brigadistas;
    private List<BrigadaHerramientaItemDto> herramientas;
    private boolean listaParaDespacho;
}
