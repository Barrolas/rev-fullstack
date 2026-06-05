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
public class DespachoAsignarItemDto {
    private Long brigadaId;
    private Long vehiculoId;
    private Long principalVehiculoId;
    private List<Long> vehiculoIds;
    private List<Long> brigadistaIds;
    private List<HerramientaCantidadDto> herramientas;
    private Boolean usarComposicionBrigada;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HerramientaCantidadDto {
        private Long herramientaId;
        private Integer cantidad;
    }
}
