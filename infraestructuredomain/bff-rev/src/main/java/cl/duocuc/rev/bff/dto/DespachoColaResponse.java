package cl.duocuc.rev.bff.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DespachoColaResponse {
    private List<DespachoColaItemDto> cola;
    private List<DespachoBrigadaCardDto> brigadasDisponibles;
    private boolean recursosDegraded;
}
