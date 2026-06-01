package cl.duocuc.rev.recursos.dto;

import java.util.List;
import lombok.Data;

@Data
public class BrigadaComposicionRequest {
    private Long vehiculoId;
    private List<Long> brigadistaIds;
    private List<HerramientaCantidadDto> herramientas;
}
