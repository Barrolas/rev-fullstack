package cl.duocuc.rev.incidentes.correlacion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GeoUtilsTest {

    @Test
    void haversine_mismaPosicion_ceroMetros() {
        double d = GeoUtils.haversineMetros(-33.5, -70.5, -33.5, -70.5);
        assertThat(d).isLessThan(0.01);
    }

    @Test
    void haversine_posicionesDistintas_mayorQueCero() {
        double d = GeoUtils.haversineMetros(-33.5, -70.5, -33.51, -70.51);
        assertThat(d).isGreaterThan(100);
    }
}
