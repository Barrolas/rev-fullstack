package cl.duocuc.rev.gateway.filter;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.OrderedGatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;

    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return new OrderedGatewayFilter((exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || authHeader.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Authorization header");
            }

            String[] parts = authHeader.split(" ");
            if (parts.length != 2 || !"Bearer".equals(parts[0])) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bad Authorization structure");
            }

            return webClientBuilder.build()
                    .get()
                    .uri("http://KEYCLOAK-ADAPTER/roles")
                    .header(HttpHeaders.AUTHORIZATION, parts[1])
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .map(response -> {
                        if (response == null || response.isEmpty()) {
                            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Roles missing");
                        }
                        boolean authorized = response.has("Despachador") || response.has("Admin");
                        if (!authorized) {
                            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Role Despachador or Admin required");
                        }
                        return exchange;
                    })
                    .onErrorMap(error -> {
                        if (error instanceof ResponseStatusException rse) {
                            return rse;
                        }
                        log.error("Gateway auth error: {}", error.getMessage());
                        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Auth service unavailable", error);
                    })
                    .flatMap(chain::filter);
        }, 1);
    }

    public static class Config {
    }
}
