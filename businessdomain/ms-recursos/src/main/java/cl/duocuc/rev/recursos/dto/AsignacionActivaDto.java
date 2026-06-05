package cl.duocuc.rev.recursos.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
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
