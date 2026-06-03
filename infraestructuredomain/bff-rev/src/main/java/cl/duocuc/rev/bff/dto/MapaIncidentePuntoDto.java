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
public class MapaIncidentePuntoDto {

    private UUID id;
    private UUID grupoId;
    private String folio;
    private String tipo;
    private String estado;
    private Double lat;
    private Double lng;
    private String direccionReferencia;
    private String origenReporte;
    private String nivelRiesgoZona;
    private boolean esCanonico;
    private long reportesEnGrupo;
    private long sugerenciasPendientes;
    private boolean tieneGrupoConfirmado;
}
