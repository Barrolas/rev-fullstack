package cl.duocuc.rev.recursos.dto;

import cl.duocuc.rev.recursos.model.EstadoRecurso;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadistaDto {
    private Long id;
    private String nombre;
    private String apellido;
    private String rut;
    private String especialidad;
    private EstadoRecurso estado;
    private Long idBrigada;
    private Long idRolBrigadista;
    private String rolCodigo;
    private String rolNombre;
    private String keycloakUsername;
    private String email;
    private Boolean esJefe;
}
