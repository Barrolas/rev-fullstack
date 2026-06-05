package cl.duocuc.rev.recursos.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class AsignarRequest {
    private UUID incidenteId;
    private Long brigadaId;
    private Long vehiculoId;
    /** Si true (default), aplica vehículo, brigadistas y herramientas definidos en la brigada. */
    private Boolean usarComposicionBrigada;
    private String despachadoPor;
    /** Subconjunto opcional; si viene vacío/null se usa la dotación completa de la brigada. */
    private List<Long> brigadistaIds;
    private List<Long> vehiculoIds;
    private Long principalVehiculoId;
    private List<HerramientaCantidadDto> herramientas;
}
