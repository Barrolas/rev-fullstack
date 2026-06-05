package cl.duocuc.rev.bff.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionActivaDto {
    private Long id;
    private UUID incidenteId;
    private Long brigadaId;
    private String brigadaNombre;
    private Long vehiculoId;
    private String vehiculoPatente;
    private String estadoDespacho;
    private String despachadoPor;
    private LocalDateTime createdAt;
}
