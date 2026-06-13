package cl.duocuc.rev.recursos.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class VincularKeycloakRequest {
    private UUID keycloakSub;
    private String keycloakUsername;
    private String email;
}
