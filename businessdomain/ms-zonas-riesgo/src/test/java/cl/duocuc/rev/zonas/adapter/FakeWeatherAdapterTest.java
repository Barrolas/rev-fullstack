package cl.duocuc.rev.zonas.adapter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import cl.duocuc.rev.zonas.dto.WeatherDataDto;
import org.junit.jupiter.api.Test;

class FakeWeatherAdapterTest {

    private final FakeWeatherAdapter adapter = new FakeWeatherAdapter();

    @Test
    void obtenerCondiciones_latCostera_retornaHumedadAlta() {
        WeatherDataDto dto = adapter.obtenerCondiciones(-33.6, -70.58);

        assertEquals("FAKE_WEATHER_ADAPTER", dto.getFuente());
        assertEquals(65, dto.getHumedadPct());
        assertNotNull(dto.getDescripcion());
    }

    @Test
    void obtenerCondiciones_latInterior_retornaSoleado() {
        WeatherDataDto dto = adapter.obtenerCondiciones(-33.4, -70.58);

        assertEquals(35, dto.getHumedadPct());
        assertEquals("Soleado, condiciones secas", dto.getDescripcion());
    }
}
