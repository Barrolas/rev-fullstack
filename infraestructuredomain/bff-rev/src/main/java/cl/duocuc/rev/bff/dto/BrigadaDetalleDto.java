package cl.duocuc.rev.bff.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadaDetalleDto {

    private Long id;
    private String nombre;
    private Integer capacidad;
    private String estado;
    private Long vehiculoId;
    private RecursosDisponiblesDto.VehiculoItemDto vehiculo;
    private List<RecursosCatalogoDto.BrigadistaItemDto> brigadistas;
    private List<BrigadaHerramientaItemDto> herramientas;
    private boolean listaParaDespacho;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrigadaHerramientaItemDto {
        private Long herramientaId;
        private String nombre;
        private Integer cantidad;
    }
}
