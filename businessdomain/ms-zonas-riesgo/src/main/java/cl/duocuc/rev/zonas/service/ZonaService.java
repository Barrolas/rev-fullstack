package cl.duocuc.rev.zonas.service;

import cl.duocuc.rev.zonas.dto.RiesgoZonaResponse;
import cl.duocuc.rev.zonas.dto.WeatherDataDto;
import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.dto.ZonaResponse;
import cl.duocuc.rev.zonas.dto.ZonaResueltaResponse;
import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.exception.BusinessRuleException;
import cl.duocuc.rev.zonas.model.NivelRiesgo;
import cl.duocuc.rev.zonas.model.TipoZona;
import cl.duocuc.rev.zonas.port.WeatherDataPort;
import cl.duocuc.rev.zonas.repository.ZonaRepository;
import cl.duocuc.rev.zonas.util.ZonaGeometryUtil;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private static final String COMUNA_DEFAULT = "Puente Alto";

    private final ZonaRepository zonaRepository;
    private final WeatherDataPort weatherDataPort;

    public List<ZonaResponse> listar(boolean incluirInactivas) {
        List<Zona> zonas = incluirInactivas
                ? zonaRepository.findAllByOrderByNombreAsc()
                : zonaRepository.findByActivaTrueOrderByNombreAsc();
        return zonas.stream().map(this::toResponse).toList();
    }

    public ZonaResponse obtener(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ZonaResponse crear(ZonaRequest request) {
        validarRequest(request);
        Zona zona = buildFromRequest(request);
        zona.setActiva(true);
        return toResponse(zonaRepository.save(zona));
    }

    @Transactional
    public ZonaResponse actualizar(Long id, ZonaRequest request) {
        validarRequest(request);
        Zona zona = findById(id);
        applyRequest(zona, request);
        return toResponse(zonaRepository.save(zona));
    }

    @Transactional
    public void desactivar(Long id) {
        Zona zona = findById(id);
        zona.setActiva(false);
        zonaRepository.save(zona);
    }

    public ZonaResueltaResponse resolverPunto(double lat, double lng) {
        Zona zona = resolverZona(lat, lng)
                .orElseThrow(() -> new BusinessRuleException(
                        "ZONA_NO_ENCONTRADA",
                        "No hay zona estrategica activa para las coordenadas indicadas",
                        HttpStatus.NOT_FOUND));
        double distancia = ZonaGeometryUtil.haversineMetros(
                zona.getCenterLat(), zona.getCenterLng(), lat, lng);
        return ZonaResueltaResponse.builder()
                .zonaId(zona.getId())
                .nombre(zona.getNombre())
                .nivelRiesgo(zona.getNivelRiesgo())
                .comuna(zona.getComuna())
                .tipo(zona.getTipo())
                .distanciaMetros(distancia)
                .build();
    }

    public RiesgoZonaResponse consultarRiesgo(double lat, double lng) {
        Zona zona = resolverZona(lat, lng)
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

    Optional<Zona> resolverZona(double lat, double lng) {
        return zonaRepository.findByActivaTrueOrderByNombreAsc().stream()
                .filter(z -> ZonaGeometryUtil.contienePunto(z, lat, lng))
                .min(Comparator
                        .comparingDouble(Zona::getRadioMetros)
                        .thenComparing(z -> -NivelRiesgo.severidad(z.getNivelRiesgo())));
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
        if (request.getCenterLat() == null || request.getCenterLng() == null || request.getRadioMetros() == null) {
            throw new BusinessRuleException(
                    "UBICACION_REQUERIDA", "Centro y radio en metros son obligatorios", HttpStatus.BAD_REQUEST);
        }
        if (request.getRadioMetros() < 200 || request.getRadioMetros() > 15_000) {
            throw new BusinessRuleException(
                    "RADIO_INVALIDO", "El radio debe estar entre 200 y 15000 metros", HttpStatus.BAD_REQUEST);
        }
        if (!TipoZona.isValid(request.getTipo())) {
            throw new BusinessRuleException(
                    "TIPO_INVALIDO", "Tipo debe ser ESTRATEGICA u OPERATIVA", HttpStatus.BAD_REQUEST);
        }
    }

    private Zona buildFromRequest(ZonaRequest request) {
        Zona zona = Zona.builder()
                .nombre(request.getNombre().trim())
                .nivelRiesgo(request.getNivelRiesgo().toUpperCase())
                .centerLat(request.getCenterLat())
                .centerLng(request.getCenterLng())
                .radioMetros(request.getRadioMetros())
                .comuna(request.getComuna() != null && !request.getComuna().isBlank()
                        ? request.getComuna().trim()
                        : COMUNA_DEFAULT)
                .tipo(request.getTipo() != null && !request.getTipo().isBlank()
                        ? request.getTipo().toUpperCase()
                        : TipoZona.ESTRATEGICA)
                .build();
        ZonaGeometryUtil.aplicarBboxDerivado(zona);
        return zona;
    }

    private void applyRequest(Zona zona, ZonaRequest request) {
        zona.setNombre(request.getNombre().trim());
        zona.setNivelRiesgo(request.getNivelRiesgo().toUpperCase());
        zona.setCenterLat(request.getCenterLat());
        zona.setCenterLng(request.getCenterLng());
        zona.setRadioMetros(request.getRadioMetros());
        if (request.getComuna() != null && !request.getComuna().isBlank()) {
            zona.setComuna(request.getComuna().trim());
        }
        if (request.getTipo() != null && !request.getTipo().isBlank()) {
            zona.setTipo(request.getTipo().toUpperCase());
        }
        ZonaGeometryUtil.aplicarBboxDerivado(zona);
    }

    private ZonaResponse toResponse(Zona zona) {
        return ZonaResponse.builder()
                .id(zona.getId())
                .nombre(zona.getNombre())
                .nivelRiesgo(zona.getNivelRiesgo())
                .centerLat(zona.getCenterLat())
                .centerLng(zona.getCenterLng())
                .radioMetros(zona.getRadioMetros())
                .comuna(zona.getComuna())
                .tipo(zona.getTipo())
                .activa(zona.isActiva())
                .minLat(zona.getMinLat())
                .maxLat(zona.getMaxLat())
                .minLng(zona.getMinLng())
                .maxLng(zona.getMaxLng())
                .build();
    }
}
