package cl.duocuc.rev.bff.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class PublicIncidenteCreateRequest {

    private String tipo;
    private String descripcion;
    private Double lat;
    private Double lng;
    private String direccionReferencia;
    private boolean anonimo = true;
    private String reportanteNombre;
    private String reportanteApellido;
    private String reportanteRut;
    private String reportanteContacto;
    private boolean registrarme;
    private String registroUsername;
    private String registroPassword;
    private String registroEmail;
    private UUID reportanteUuid;
}
