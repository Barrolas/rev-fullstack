package cl.duocuc.rev.recursos.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecursoAsignadoDto {
    private UUID id;
    private UUID incidenteId;
    private String tipo;
    private String estado;
    private String descripcion;
}
