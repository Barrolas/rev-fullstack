package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecursoDto {

    private UUID id;
    private UUID incidenteId;
    private String tipo;
    private String estado;
    private String descripcion;
}
