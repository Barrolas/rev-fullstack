package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdjuntoDto {

    private UUID id;
    private UUID incidenteId;
    private String tipo;
    private String nombreArchivo;
    private String mimeType;
    private long tamanoBytes;
    private int orden;
}
