package cl.duocuc.rev.incidentes.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class VincularIncidenteRequest {
    private UUID incidenteCanonicoId;
}
