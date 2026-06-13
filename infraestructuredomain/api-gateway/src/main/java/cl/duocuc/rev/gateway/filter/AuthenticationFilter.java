package cl.duocuc.rev.gateway.filter;

import cl.duocuc.rev.gateway.config.RevGatewayProperties;
import cl.duocuc.rev.gateway.util.JwtPayloadDecoder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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
import org.springframework.web.server.ServerWebExchange;

@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final RevGatewayProperties gatewayProperties;
    private final RouteAuthorizationPolicy routeAuthorizationPolicy;

    public AuthenticationFilter(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            RevGatewayProperties gatewayProperties,
            RouteAuthorizationPolicy routeAuthorizationPolicy) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
        this.gatewayProperties = gatewayProperties;
        this.routeAuthorizationPolicy = routeAuthorizationPolicy;
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

            String bearerToken = parts[1];
            return webClientBuilder.build()
                    .get()
                    .uri(gatewayProperties.getKeycloakRolesUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(json -> enrichExchange(json, bearerToken, exchange))
                    .onErrorMap(this::mapAuthError)
                    .flatMap(chain::filter);
        }, 1);
    }

    private Throwable mapAuthError(Throwable error) {
        if (error instanceof ResponseStatusException rse) {
            return rse;
        }
        if (error instanceof WebClientResponseException wcre) {
            if (wcre.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                log.warn("Keycloak adapter not registered yet: {}", wcre.getMessage());
                return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Auth service not ready", error);
            }
            if (wcre.getStatusCode().value() == HttpStatus.UNAUTHORIZED.value()
                    || wcre.getStatusCode().value() == HttpStatus.FORBIDDEN.value()) {
                log.warn("Gateway auth rejected: {}", wcre.getMessage());
                return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalid or expired", error);
            }
            if (wcre.getStatusCode().is4xxClientError()) {
                log.warn("Gateway auth client error: {}", wcre.getMessage());
                return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Auth service error", error);
            }
        }
        log.error("Gateway auth error: {}", error.getMessage());
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Auth service unavailable", error);
    }

    private ServerWebExchange enrichExchange(String json, String bearerToken, ServerWebExchange exchange) {
        try {
            JsonNode response = objectMapper.readTree(json);
            if (response == null || response.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Roles missing");
            }
            List<String> roles = JwtPayloadDecoder.extractRoles(bearerToken);
            boolean authorized = roles.contains("Despachador")
                    || roles.contains("Admin")
                    || roles.contains("Brigadista");
            if (!authorized) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Role Despachador, Admin or Brigadista required");
            }

            String path = exchange.getRequest().getURI().getPath();
            String method = exchange.getRequest().getMethod().name();
            routeAuthorizationPolicy.checkWriteAccess(method, path, roles);

            String sub = JwtPayloadDecoder.extractSub(bearerToken);
            String username = JwtPayloadDecoder.extractUsername(bearerToken);
            var mutated = exchange.mutate().request(exchange.getRequest().mutate()
                    .header("X-REV-Sub", sub != null ? sub : "")
                    .header("X-REV-Username", username != null ? username : "")
                    .header("X-REV-Roles", String.join(",", roles))
                    .build()).build();
            return mutated;
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid roles response", ex);
        }
    }

    public static class Config {
    }
}
