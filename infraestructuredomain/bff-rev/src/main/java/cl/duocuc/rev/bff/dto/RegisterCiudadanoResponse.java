package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterCiudadanoResponse {

    private UUID userId;
    private String username;
}
