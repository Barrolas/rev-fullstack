package cl.duocuc.rev.bff.dto;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DespachoAsignarLoteRequest {
    private UUID incidenteId;
    private String despachadoPor;
    private List<DespachoAsignarItemDto> items;
}
