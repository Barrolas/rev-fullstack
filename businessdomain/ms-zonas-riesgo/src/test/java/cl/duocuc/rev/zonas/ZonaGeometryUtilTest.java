package cl.duocuc.rev.zonas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.util.ZonaGeometryUtil;
import org.junit.jupiter.api.Test;

class ZonaGeometryUtilTest {

    @Test
    void contienePunto_dentroDelRadio() {
        Zona zona = zonaCircular(-33.444, -70.582, 1200);
        assertTrue(ZonaGeometryUtil.contienePunto(zona, -33.444, -70.582));
    }

    @Test
    void contienePunto_fueraDelRadio() {
        Zona zona = zonaCircular(-33.444, -70.582, 500);
        assertFalse(ZonaGeometryUtil.contienePunto(zona, -33.5, -70.7));
    }

    @Test
    void contienePunto_zonaInactiva_retornaFalse() {
        Zona zona = zonaCircular(-33.444, -70.582, 5000);
        zona.setActiva(false);
        assertFalse(ZonaGeometryUtil.contienePunto(zona, -33.444, -70.582));
    }

    @Test
    void aplicarBboxDerivado_sincronizaLimites() {
        Zona zona = zonaCircular(-33.444, -70.582, 1000);
        ZonaGeometryUtil.aplicarBboxDerivado(zona);
        assertTrue(zona.getMinLat() < zona.getCenterLat());
        assertTrue(zona.getMaxLat() > zona.getCenterLat());
        assertTrue(zona.getMinLng() < zona.getCenterLng());
        assertTrue(zona.getMaxLng() > zona.getCenterLng());
    }

    @Test
    void haversineMetros_mismaPosicion_cero() {
        assertEquals(0, ZonaGeometryUtil.haversineMetros(-33.44, -70.58, -33.44, -70.58), 0.5);
    }

    @Test
    void haversineMetros_puntosDistintos_retornaDistanciaPositiva() {
        double metros = ZonaGeometryUtil.haversineMetros(-33.44, -70.58, -33.45, -70.59);
        assertTrue(metros > 1000);
    }

    @Test
    void centerLat_legacySinCenter_usaBbox() {
        Zona zona = Zona.builder().minLat(-33.5).maxLat(-33.3).build();
        assertEquals(-33.4, ZonaGeometryUtil.centerLat(zona), 0.001);
    }

    @Test
    void centerLng_legacySinCenter_usaBbox() {
        Zona zona = Zona.builder().minLng(-70.7).maxLng(-70.5).build();
        assertEquals(-70.6, ZonaGeometryUtil.centerLng(zona), 0.001);
    }

    @Test
    void radioMetros_legacySinRadio_derivaDesdeBbox() {
        Zona zona = Zona.builder()
                .minLat(-33.5)
                .maxLat(-33.3)
                .minLng(-70.7)
                .maxLng(-70.5)
                .build();
        assertTrue(ZonaGeometryUtil.radioMetros(zona) > 0);
    }

    @Test
    void centerLat_conCenterExplicito_loUsa() {
        Zona zona = Zona.builder().centerLat(-33.44).minLat(-33.5).maxLat(-33.3).build();
        assertEquals(-33.44, ZonaGeometryUtil.centerLat(zona), 0.001);
    }

    private static Zona zonaCircular(double lat, double lng, double radio) {
        return Zona.builder()
                .centerLat(lat)
                .centerLng(lng)
                .radioMetros(radio)
                .activa(true)
                .build();
    }
}
