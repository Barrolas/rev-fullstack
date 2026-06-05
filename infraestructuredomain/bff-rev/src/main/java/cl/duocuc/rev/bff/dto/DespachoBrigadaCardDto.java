package cl.duocuc.rev.bff.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DespachoBrigadaCardDto {
    private Long id;
    private String nombre;
    private String codigo;
    private String estado;
    private boolean listaParaDespacho;
    private BrigadaElegibilidadDto elegibilidad;
    private BrigadaDetalleDto detalle;
}
