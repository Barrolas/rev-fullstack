package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.IncidenteDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class IncidenteClientService {

    private static final String BASE_URL = "http://MS-INCIDENTES";

    private final WebClient.Builder webClientBuilder;

    public Mono<IncidenteDto> obtenerPorId(UUID id) {
        return webClient()
                .get()
                .uri("/incidentes/{id}", id)
                .retrieve()
                .bodyToMono(IncidenteDto.class);
    }

    public Mono<List<IncidenteDto>> listar() {
        return webClient()
                .get()
                .uri("/incidentes")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
