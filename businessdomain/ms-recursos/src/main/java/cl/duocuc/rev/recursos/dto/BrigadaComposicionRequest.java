package cl.duocuc.rev.recursos.dto;

import java.util.List;
import lombok.Data;

@Data
public class BrigadaComposicionRequest {
    private Long jefeBrigadistaId;
    private Long vehiculoId;
    private List<Long> vehiculoIds;
    private Long principalVehiculoId;
    private List<Long> brigadistaIds;
    private List<HerramientaCantidadDto> herramientas;
}
