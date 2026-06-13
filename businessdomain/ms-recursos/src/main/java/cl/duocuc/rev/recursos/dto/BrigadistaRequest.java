package cl.duocuc.rev.recursos.dto;

import lombok.Data;

@Data
public class BrigadistaRequest {
    private String nombre;
    private String apellido;
    private String rut;
    private String especialidad;
    private Long idRolBrigadista;
    private java.util.UUID keycloakSub;
    private String keycloakUsername;
    private String email;
}
