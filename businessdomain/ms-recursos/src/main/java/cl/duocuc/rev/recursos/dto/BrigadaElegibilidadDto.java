package cl.duocuc.rev.recursos.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrigadaElegibilidadDto {
    private Long brigadaId;
    private boolean listaParaDespacho;
    private List<String> motivos;
    private int integrantes;
    private int capacidadBrigada;
    private Integer capacidadPasajerosVehiculoPrincipal;
}
