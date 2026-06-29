package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.config.PublicReportProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class NominatimGeocodingServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    private PublicReportProperties properties;

    private NominatimGeocodingService geocodingService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        properties = new PublicReportProperties();
        properties.setNominatimUrl("https://nominatim.test/search");
        properties.setNominatimUserAgent("REV-Test/1.0");
        geocodingService = new NominatimGeocodingService(webClientBuilder, properties);
    }

    @Test
    void geocode_queryBlank_lanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode("  "));
        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode(null));
    }

    @Test
    @SuppressWarnings("unchecked")
    void geocode_sinResultados_lanzaExcepcion() {
        WebClient webClient = mock(WebClient.class);
        WebClient.RequestHeadersUriSpec requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClientBuilder.build()).thenReturn(webClient);
        doReturn(requestHeadersUriSpec).when(webClient).get();
        doReturn(requestHeadersSpec).when(requestHeadersUriSpec).uri(anyString());
        doReturn(requestHeadersSpec).when(requestHeadersSpec).header(eq("User-Agent"), eq("REV-Test/1.0"));
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(JsonNode[].class)).thenReturn(Mono.just(new JsonNode[0]));

        assertThrows(IllegalArgumentException.class, () -> geocodingService.geocode("Calle Falsa 123"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void geocode_resultadoOk_retornaCoordenadas() throws Exception {
        WebClient webClient = mock(WebClient.class);
        WebClient.RequestHeadersUriSpec requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
        JsonNode result = objectMapper.readTree("{\"lat\":\"-33.45\",\"lon\":\"-70.66\"}");
        JsonNode[] results = new JsonNode[] {result};

        when(webClientBuilder.build()).thenReturn(webClient);
        doReturn(requestHeadersUriSpec).when(webClient).get();
        doReturn(requestHeadersSpec).when(requestHeadersUriSpec).uri(anyString());
        doReturn(requestHeadersSpec).when(requestHeadersSpec).header(eq("User-Agent"), eq("REV-Test/1.0"));
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(JsonNode[].class)).thenReturn(Mono.just(results));

        NominatimGeocodingService.GeoPoint point = geocodingService.geocode("Valle del Sol 100");

        assertEquals(-33.45, point.lat());
        assertEquals(-70.66, point.lng());
        verify(requestHeadersUriSpec).uri(contains("countrycodes=cl"));
    }
}
