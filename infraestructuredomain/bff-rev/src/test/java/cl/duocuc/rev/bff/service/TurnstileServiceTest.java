package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.config.PublicReportProperties;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class TurnstileServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    private PublicReportProperties properties;

    private TurnstileService turnstileService;

    @BeforeEach
    void setUp() {
        properties = new PublicReportProperties();
        turnstileService = new TurnstileService(webClientBuilder, properties);
    }

    @Test
    void verify_secretDisabled_noLlamaWebClient() {
        properties.setTurnstileSecret("disabled");

        assertDoesNotThrow(() -> turnstileService.verify(null, "127.0.0.1"));

        verify(webClientBuilder, never()).build();
    }

    @Test
    void verify_secretBlank_noLlamaWebClient() {
        properties.setTurnstileSecret("");

        assertDoesNotThrow(() -> turnstileService.verify("cualquier-token", null));

        verify(webClientBuilder, never()).build();
    }

    @Test
    void verify_tokenBlank_lanzaExcepcion() {
        properties.setTurnstileSecret("test-secret");

        assertThrows(IllegalArgumentException.class, () -> turnstileService.verify("  ", "127.0.0.1"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void verify_respuestaExitosa_ok() {
        properties.setTurnstileSecret("test-secret");
        properties.setTurnstileVerifyUrl("https://turnstile.test/verify");

        WebClient webClient = mock(WebClient.class);
        WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestBodySpec requestBodySpec = mock(WebClient.RequestBodySpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_FORM_URLENCODED)).thenReturn(requestBodySpec);
        doReturn(requestHeadersSpec).when(requestBodySpec).body(any());
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(Map.of("success", true)));

        assertDoesNotThrow(() -> turnstileService.verify("token-valido", "192.168.1.1"));

        verify(webClientBuilder).build();
        verify(requestBodyUriSpec).uri("https://turnstile.test/verify");
    }

    @Test
    @SuppressWarnings("unchecked")
    void verify_respuestaInvalida_lanzaExcepcion() {
        properties.setTurnstileSecret("test-secret");

        WebClient webClient = mock(WebClient.class);
        WebClient.RequestBodyUriSpec requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestBodySpec requestBodySpec = mock(WebClient.RequestBodySpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(MediaType.APPLICATION_FORM_URLENCODED)).thenReturn(requestBodySpec);
        doReturn(requestHeadersSpec).when(requestBodySpec).body(any());
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(Map.of("success", false)));

        assertThrows(IllegalArgumentException.class, () -> turnstileService.verify("token-invalido", null));
    }
}
