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
public class RecursosCatalogoDto {

    private List<RecursosDisponiblesDto.BrigadaItemDto> brigadas;
    private List<RecursosDisponiblesDto.VehiculoItemDto> vehiculos;
    private List<RecursosDisponiblesDto.HerramientaItemDto> herramientas;
    private List<BrigadistaItemDto> brigadistas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrigadistaItemDto {
        private Long id;
        private String nombre;
        private String apellido;
        private String rut;
        private String especialidad;
        private String estado;
    }
}
