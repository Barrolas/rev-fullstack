package cl.duocuc.rev.incidentes.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class ResumenBatchRequest {
    private List<UUID> incidenteIds;
}
