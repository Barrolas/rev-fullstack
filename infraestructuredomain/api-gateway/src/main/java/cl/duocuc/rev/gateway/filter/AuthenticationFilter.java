package cl.duocuc.rev.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.OrderedGatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    public AuthenticationFilter(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
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
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + parts[1])
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(json -> parseRoles(json, exchange))
                    .onErrorMap(error -> {
                        if (error instanceof ResponseStatusException rse) {
                            return rse;
                        }
                        if (error instanceof WebClientResponseException wcre) {
                            if (wcre.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                                log.warn("Keycloak adapter not registered yet: {}", wcre.getMessage());
                                return new ResponseStatusException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "Auth service not ready",
                                        error);
                            }
                            if (wcre.getStatusCode().value() == HttpStatus.UNAUTHORIZED.value()
                                    || wcre.getStatusCode().value() == HttpStatus.FORBIDDEN.value()) {
                                log.warn("Gateway auth rejected: {}", wcre.getMessage());
                                return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalid or expired", error);
                            }
                            if (wcre.getStatusCode().is4xxClientError()) {
                                log.warn("Gateway auth client error: {}", wcre.getMessage());
                                return new ResponseStatusException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "Auth service error",
                                        error);
                            }
                        }
                        log.error("Gateway auth error: {}", error.getMessage());
                        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Auth service unavailable", error);
                    })
                    .flatMap(chain::filter);
        }, 1);
    }

    private org.springframework.web.server.ServerWebExchange parseRoles(String json, org.springframework.web.server.ServerWebExchange exchange) {
        try {
            JsonNode response = objectMapper.readTree(json);
            if (response == null || response.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Roles missing");
            }
            boolean authorized = response.has("Despachador")
                    || response.has("Admin")
                    || response.has("Brigadista");
            if (!authorized) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Role Despachador, Admin or Brigadista required");
            }
            return exchange;
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid roles response", ex);
        }
    }

    public static class Config {
    }
}
