package cl.duocuc.rev.incidentes.client;

import java.util.Optional;
import lombok.Data;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
public class ZonaResolverClient {

    private static final String BASE_URL = "http://MS-ZONAS-RIESGO";

    private final RestClient.Builder restClientBuilder;

    public ZonaResolverClient(@Qualifier("loadBalancedRestClientBuilder") RestClient.Builder restClientBuilder) {
        this.restClientBuilder = restClientBuilder;
    }

    public Optional<ZonaResuelta> resolver(double lat, double lng) {
        try {
            ZonaResuelta body = restClient()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/zonas/resolver")
                            .queryParam("lat", lat)
                            .queryParam("lng", lng)
                            .build())
                    .retrieve()
                    .body(ZonaResuelta.class);
            return Optional.ofNullable(body);
        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return Optional.empty();
            }
            throw ex;
        } catch (RuntimeException ex) {
            // No bloquear reporte público si ms-zonas no responde (timeout / caída).
            return Optional.empty();
        }
    }

    private RestClient restClient() {
        return restClientBuilder.baseUrl(BASE_URL).build();
    }

    @Data
    public static class ZonaResuelta {
        private Long zonaId;
        private String nombre;
        private String nivelRiesgo;
        private String comuna;
        private String tipo;
        private Double distanciaMetros;
    }
}
