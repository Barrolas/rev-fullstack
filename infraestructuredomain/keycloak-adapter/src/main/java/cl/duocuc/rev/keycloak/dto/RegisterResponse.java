package cl.duocuc.rev.keycloak.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponse {

    private UUID userId;
    private String username;
}
