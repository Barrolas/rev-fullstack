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
public class RecursosDisponiblesDto {

    private List<BrigadaItemDto> brigadas;
    private List<VehiculoItemDto> vehiculos;
    private List<HerramientaItemDto> herramientas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrigadaItemDto {
        private Long id;
        private String nombre;
        private Integer capacidad;
        private String estado;
        private Long vehiculoId;
        private String codigo;
        private Long idCompania;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehiculoItemDto {
        private Long id;
        private String patente;
        private String tipo;
        private String estado;
        private String marca;
        private String modelo;
        private Short anio;
        private Integer capacidadPasajeros;
        private Integer capacidadCarga;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HerramientaItemDto {
        private Long id;
        private String nombre;
        private Integer cantidadTotal;
        private Integer cantidadDisponible;
        private String marca;
        private String modelo;
        private String sku;
        private String estado;
    }
}
