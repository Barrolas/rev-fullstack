package cl.duocuc.rev.zonas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.util.ZonaGeometryUtil;
import org.junit.jupiter.api.Test;

class ZonaGeometryUtilTest {

    @Test
    void radioMetros_cubreEsquinasDelBbox() {
        Zona zona = Zona.builder()
                .minLat(-34.0)
                .maxLat(-33.2)
                .minLng(-71.0)
                .maxLng(-70.3)
                .build();
        double centerLat = ZonaGeometryUtil.centerLat(zona);
        double centerLng = ZonaGeometryUtil.centerLng(zona);
        double radio = ZonaGeometryUtil.radioMetros(zona);

        assertEquals((-34.0 + -33.2) / 2, centerLat, 0.0001);
        assertEquals((-71.0 + -70.3) / 2, centerLng, 0.0001);
        assertTrue(radio > 30_000);
        assertTrue(radio < 80_000);
    }
}
