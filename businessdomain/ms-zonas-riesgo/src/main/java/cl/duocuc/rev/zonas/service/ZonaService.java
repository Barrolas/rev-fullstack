package cl.duocuc.rev.zonas.service;

import cl.duocuc.rev.zonas.dto.RiesgoZonaResponse;
import cl.duocuc.rev.zonas.dto.WeatherDataDto;
import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.exception.BusinessRuleException;
import cl.duocuc.rev.zonas.port.WeatherDataPort;
import cl.duocuc.rev.zonas.repository.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final WeatherDataPort weatherDataPort;

    public RiesgoZonaResponse consultarRiesgo(double lat, double lng) {
        Zona zona = zonaRepository.findByCoordenadas(lat, lng)
                .orElseThrow(() -> new BusinessRuleException(
                        "ZONA_NO_ENCONTRADA",
                        "No existe zona de riesgo para las coordenadas indicadas",
                        HttpStatus.NOT_FOUND));
        WeatherDataDto clima = weatherDataPort.obtenerCondiciones(lat, lng);
        return RiesgoZonaResponse.builder()
                .zonaId(zona.getId())
                .nombreZona(zona.getNombre())
                .nivelRiesgo(zona.getNivelRiesgo())
                .lat(lat)
                .lng(lng)
                .temperaturaC(clima.getTemperaturaC())
                .humedadPct(clima.getHumedadPct())
                .vientoKmh(clima.getVientoKmh())
                .condicionClimatica(clima.getDescripcion())
                .fuenteClima(clima.getFuente())
                .build();
    }
}
