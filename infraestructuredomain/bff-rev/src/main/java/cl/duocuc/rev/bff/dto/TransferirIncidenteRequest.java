package cl.duocuc.rev.bff.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class TransferirIncidenteRequest {
    private List<Long> asignacionIds;
    private UUID nuevoIncidenteId;
}
