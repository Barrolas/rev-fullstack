package cl.duocuc.rev.zonas.port;

import cl.duocuc.rev.zonas.dto.WeatherDataDto;

public interface WeatherDataPort {

    WeatherDataDto obtenerCondiciones(double lat, double lng);
}
