package cl.duocuc.rev.bff.dto;

import java.util.List;
import lombok.Data;

@Data
public class BrigadaComposicionRequest {
    private Long jefeBrigadistaId;
    private Long vehiculoId;
    private List<Long> vehiculoIds;
    private Long principalVehiculoId;
    private List<Long> brigadistaIds;
    private List<HerramientaCantidadRequest> herramientas;

    @Data
    public static class HerramientaCantidadRequest {
        private Long herramientaId;
        private Integer cantidad;
    }
}
