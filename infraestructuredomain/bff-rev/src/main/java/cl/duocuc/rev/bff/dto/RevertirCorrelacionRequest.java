package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class RevertirCorrelacionRequest {
    private UUID reasignarAsignacionesA;
}
