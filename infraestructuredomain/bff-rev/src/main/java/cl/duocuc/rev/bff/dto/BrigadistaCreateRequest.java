package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class BrigadistaCreateRequest {
    private String nombre;
    private String apellido;
    private String rut;
    private String especialidad;
    private Long idRolBrigadista;
    private String email;
    private String password;
    private String keycloakUsername;
    private UUID keycloakSub;
}
