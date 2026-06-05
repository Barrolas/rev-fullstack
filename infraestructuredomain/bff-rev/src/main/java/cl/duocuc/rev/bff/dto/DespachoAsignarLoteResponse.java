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
public class DespachoAsignarLoteResponse {
    private int exitosos;
    private int fallidos;
    private List<DespachoAsignarResultadoDto> resultados;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DespachoAsignarResultadoDto {
        private Long brigadaId;
        private boolean ok;
        private Long asignacionId;
        private String mensaje;
    }
}
