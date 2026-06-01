package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.config.PublicReportProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class NominatimGeocodingService {

    private final WebClient.Builder webClientBuilder;
    private final PublicReportProperties properties;

    public GeoPoint geocode(String query) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("Direccion vacia para geocodificar");
        }
        String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
        String uri = properties.getNominatimUrl()
                + "?q=" + encoded
                + "&format=json&limit=1&countrycodes=cl";

        JsonNode[] results = webClientBuilder.build()
                .get()
                .uri(uri)
                .header("User-Agent", properties.getNominatimUserAgent())
                .retrieve()
                .bodyToMono(JsonNode[].class)
                .block();

        if (results == null || results.length == 0) {
            throw new IllegalArgumentException("No se encontro la direccion indicada. Marque el punto en el mapa.");
        }
        JsonNode first = results[0];
        return new GeoPoint(first.get("lat").asDouble(), first.get("lon").asDouble());
    }

    public record GeoPoint(double lat, double lng) {
    }
}
