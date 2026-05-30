package cl.duocuc.rev.bff.cache;

import cl.duocuc.rev.bff.dto.ZonaRiesgoDto;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class ZonaRiesgoCache {

    private final ConcurrentHashMap<String, ZonaRiesgoDto> cache = new ConcurrentHashMap<>();

    public void put(double lat, double lng, ZonaRiesgoDto zonaRiesgo) {
        cache.put(key(lat, lng), zonaRiesgo);
    }

    public Optional<ZonaRiesgoDto> get(double lat, double lng) {
        return Optional.ofNullable(cache.get(key(lat, lng)));
    }

    private String key(double lat, double lng) {
        return lat + "," + lng;
    }
}
