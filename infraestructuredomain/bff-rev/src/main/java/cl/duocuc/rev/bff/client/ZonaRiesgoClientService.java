package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.ZonaDto;
import cl.duocuc.rev.bff.dto.ZonaRiesgoDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ZonaRiesgoClientService {

    private static final String BASE_URL = "http://MS-ZONAS-RIESGO";

    private final WebClient.Builder webClientBuilder;

    public Mono<List<ZonaDto>> listar(boolean incluirInactivas) {
        return webClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/zonas")
                        .queryParam("incluirInactivas", incluirInactivas)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<ZonaDto> crear(ZonaDto request) {
        return webClient()
                .post()
                .uri("/zonas")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ZonaDto.class);
    }

    public Mono<ZonaDto> actualizar(Long id, ZonaDto request) {
        return webClient()
                .put()
                .uri("/zonas/{id}", id)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ZonaDto.class);
    }

    public Mono<Void> desactivar(Long id) {
        return webClient()
                .delete()
                .uri("/zonas/{id}", id)
                .retrieve()
                .bodyToMono(Void.class);
    }

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
                        .zonaId(response.getZonaId())
                        .nombreZona(response.getNombreZona())
                        .lat(lat)
                        .lng(lng)
                        .cached(false)
                        .build());
    }

    @lombok.Data
    private static class RiesgoZonaClientResponse {
        private Long zonaId;
        private String nombreZona;
        private String nivelRiesgo;
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
