package cl.duocuc.rev.bff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaRiesgoDto {

    private String nivel;
    private Double lat;
    private Double lng;
    private boolean cached;
}
