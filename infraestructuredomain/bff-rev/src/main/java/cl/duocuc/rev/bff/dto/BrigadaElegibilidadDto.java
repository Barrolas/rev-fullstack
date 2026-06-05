package cl.duocuc.rev.bff.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadaElegibilidadDto {
    private Long brigadaId;
    private boolean listaParaDespacho;
    private List<String> motivos;
    private int integrantes;
    private int capacidadBrigada;
    private Integer capacidadPasajerosVehiculoPrincipal;
}
