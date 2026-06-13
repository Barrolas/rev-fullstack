package cl.duocuc.rev.bff.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PerfilOperativoDto {
    private boolean operador;
    private Long brigadistaId;
    private Long brigadaId;
    private String brigadaNombre;
    private String brigadaCodigo;
    private String rolCodigo;
    private String rolNombre;
    private boolean esJefe;
    private boolean puedeTransicionarIncidente;
    private String username;
    private String nombre;
    private String apellido;
}
