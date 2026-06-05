package cl.duocuc.rev.recursos.dto;

import java.util.List;
import lombok.Data;

@Data
public class BrigadaVehiculosRequest {
    private List<Long> vehiculoIds;
    private Long principalVehiculoId;
}
