package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.RegisterCiudadanoRequest;
import cl.duocuc.rev.bff.dto.RegisterCiudadanoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KeycloakRegisterClient {

    private static final String BASE_URL = "http://KEYCLOAK-ADAPTER";

    private final WebClient.Builder webClientBuilder;

    public Mono<RegisterCiudadanoResponse> registrar(RegisterCiudadanoRequest request) {
        return webClientBuilder.baseUrl(BASE_URL)
                .build()
                .post()
                .uri("/register")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RegisterCiudadanoResponse.class);
    }
}
