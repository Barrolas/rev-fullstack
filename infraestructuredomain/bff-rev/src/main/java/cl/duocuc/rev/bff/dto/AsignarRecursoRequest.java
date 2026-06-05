package cl.duocuc.rev.bff.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class AsignarRecursoRequest {

    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
    private Long principalVehiculoId;
    private List<Long> vehiculoIds;
    private List<Long> brigadistaIds;
    private List<DespachoAsignarItemDto.HerramientaCantidadDto> herramientas;
    private Boolean usarComposicionBrigada;
    private String despachadoPor;
}
