package cl.duocuc.rev.incidentes.dto;

import cl.duocuc.rev.incidentes.model.TipoAdjunto;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdjuntoResponse {

    private UUID id;
    private UUID incidenteId;
    private TipoAdjunto tipo;
    private String nombreArchivo;
    private String mimeType;
    private long tamanoBytes;
    private int orden;
    private LocalDateTime createdAt;
}
