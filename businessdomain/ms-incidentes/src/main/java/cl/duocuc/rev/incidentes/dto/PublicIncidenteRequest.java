package cl.duocuc.rev.incidentes.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class PublicIncidenteRequest {

    private String tipo;
    private String descripcion;
    private Double lat;
    private Double lng;
    private String direccionReferencia;
    private boolean anonimo;
    private String reportanteNombre;
    private String reportanteApellido;
    private String reportanteRut;
    private String reportanteContacto;
    private UUID reportanteUuid;
}
