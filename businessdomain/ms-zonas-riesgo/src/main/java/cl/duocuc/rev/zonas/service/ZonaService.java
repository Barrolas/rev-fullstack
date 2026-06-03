package cl.duocuc.rev.zonas.service;

import cl.duocuc.rev.zonas.dto.RiesgoZonaResponse;
import cl.duocuc.rev.zonas.dto.WeatherDataDto;
import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.dto.ZonaResponse;
import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.exception.BusinessRuleException;
import cl.duocuc.rev.zonas.model.NivelRiesgo;
import cl.duocuc.rev.zonas.port.WeatherDataPort;
import cl.duocuc.rev.zonas.repository.ZonaRepository;
import cl.duocuc.rev.zonas.util.ZonaGeometryUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final WeatherDataPort weatherDataPort;

    public List<ZonaResponse> listar() {
        return zonaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ZonaResponse obtener(Long id) {
        return toResponse(findById(id));
    }

    public ZonaResponse crear(ZonaRequest request) {
        validarRequest(request);
        Zona zona = Zona.builder()
                .nombre(request.getNombre().trim())
                .nivelRiesgo(request.getNivelRiesgo().toUpperCase())
                .minLat(request.getMinLat())
                .maxLat(request.getMaxLat())
                .minLng(request.getMinLng())
                .maxLng(request.getMaxLng())
                .build();
        return toResponse(zonaRepository.save(zona));
    }

    public ZonaResponse actualizar(Long id, ZonaRequest request) {
        validarRequest(request);
        Zona zona = findById(id);
        zona.setNombre(request.getNombre().trim());
        zona.setNivelRiesgo(request.getNivelRiesgo().toUpperCase());
        zona.setMinLat(request.getMinLat());
        zona.setMaxLat(request.getMaxLat());
        zona.setMinLng(request.getMinLng());
        zona.setMaxLng(request.getMaxLng());
        return toResponse(zonaRepository.save(zona));
    }

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

    private Zona findById(Long id) {
        return zonaRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException(
                        "ZONA_NO_ENCONTRADA", "Zona no encontrada", HttpStatus.NOT_FOUND));
    }

    private void validarRequest(ZonaRequest request) {
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new BusinessRuleException(
                    "NOMBRE_REQUERIDO", "El nombre de la zona es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (!NivelRiesgo.isValid(request.getNivelRiesgo())) {
            throw new BusinessRuleException(
                    "NIVEL_INVALIDO", "Nivel de riesgo debe ser LOW, MEDIUM o HIGH", HttpStatus.BAD_REQUEST);
        }
        if (request.getMinLat() == null || request.getMaxLat() == null
                || request.getMinLng() == null || request.getMaxLng() == null) {
            throw new BusinessRuleException(
                    "UBICACION_REQUERIDA", "Los limites geograficos son obligatorios", HttpStatus.BAD_REQUEST);
        }
        if (request.getMinLat() >= request.getMaxLat() || request.getMinLng() >= request.getMaxLng()) {
            throw new BusinessRuleException(
                    "LIMITES_INVALIDOS", "Los limites geograficos no son validos", HttpStatus.BAD_REQUEST);
        }
    }

    private ZonaResponse toResponse(Zona zona) {
        return ZonaResponse.builder()
                .id(zona.getId())
                .nombre(zona.getNombre())
                .nivelRiesgo(zona.getNivelRiesgo())
                .minLat(zona.getMinLat())
                .maxLat(zona.getMaxLat())
                .minLng(zona.getMinLng())
                .maxLng(zona.getMaxLng())
                .centerLat(ZonaGeometryUtil.centerLat(zona))
                .centerLng(ZonaGeometryUtil.centerLng(zona))
                .radioMetros(ZonaGeometryUtil.radioMetros(zona))
                .build();
    }
}
