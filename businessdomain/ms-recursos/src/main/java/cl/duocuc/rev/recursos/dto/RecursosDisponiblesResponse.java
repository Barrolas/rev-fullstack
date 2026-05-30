package cl.duocuc.rev.recursos.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecursosDisponiblesResponse {
    private List<BrigadaDto> brigadas;
    private List<VehiculoDto> vehiculos;
    private List<HerramientaDto> herramientas;
}
