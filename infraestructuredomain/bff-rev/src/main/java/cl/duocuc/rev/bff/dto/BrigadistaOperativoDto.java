package cl.duocuc.rev.bff.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadistaOperativoDto {
    private Long brigadistaId;
    private Long brigadaId;
    private String brigadaNombre;
    private String brigadaCodigo;
    private String rolCodigo;
    private boolean esJefe;
    private String username;
}
