package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.RecursoDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RecursosClientService {

    private static final String BASE_URL = "http://MS-RECURSOS";

    private final WebClient.Builder webClientBuilder;

    public Mono<List<RecursoDto>> listarPorIncidente(UUID incidenteId) {
        return webClient()
                .get()
                .uri("/recursos/incidente/{incidenteId}", incidenteId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<RecursosDisponiblesDto> listarDisponibles() {
        return webClient()
                .get()
                .uri("/recursos/disponibles")
                .retrieve()
                .bodyToMono(RecursosDisponiblesDto.class);
    }

    public Mono<AsignacionDto> asignar(AsignarRecursoRequest request) {
        return webClient()
                .post()
                .uri("/recursos/asignar")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AsignacionDto.class);
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
