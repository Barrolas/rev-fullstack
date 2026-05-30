package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.ZonaRiesgoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ZonaRiesgoClientService {

    private static final String BASE_URL = "http://MS-ZONAS-RIESGO";

    private final WebClient.Builder webClientBuilder;

    public Mono<ZonaRiesgoDto> evaluar(double lat, double lng) {
        return webClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/zonas/riesgo")
                        .queryParam("lat", lat)
                        .queryParam("lng", lng)
                        .build())
                .retrieve()
                .bodyToMono(RiesgoZonaClientResponse.class)
                .map(response -> ZonaRiesgoDto.builder()
                        .nivel(response.getNivelRiesgo())
                        .lat(lat)
                        .lng(lng)
                        .cached(false)
                        .build());
    }

    @lombok.Data
    private static class RiesgoZonaClientResponse {
        private String nivelRiesgo;
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
