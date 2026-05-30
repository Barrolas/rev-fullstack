package cl.duocuc.rev.zonas.adapter;

import cl.duocuc.rev.zonas.dto.WeatherDataDto;
import cl.duocuc.rev.zonas.port.WeatherDataPort;
import org.springframework.stereotype.Component;

@Component
public class FakeWeatherAdapter implements WeatherDataPort {

    @Override
    public WeatherDataDto obtenerCondiciones(double lat, double lng) {
        double temperatura = 20.0 + Math.abs(lat % 10);
        int humedad = lat < -33.5 ? 65 : 35;
        double viento = 10.0 + Math.abs(lng % 15);
        String descripcion = humedad > 50 ? "Nublado con humedad costera" : "Soleado, condiciones secas";
        return WeatherDataDto.builder()
                .temperaturaC(temperatura)
                .humedadPct(humedad)
                .vientoKmh(viento)
                .descripcion(descripcion)
                .fuente("FAKE_WEATHER_ADAPTER")
                .build();
    }
}
