package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.config.PublicReportProperties;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class TurnstileService {

    private final WebClient.Builder webClientBuilder;
    private final PublicReportProperties properties;

    public void verify(String token, String remoteIp) {
        if (properties.getTurnstileSecret() == null || properties.getTurnstileSecret().isBlank()
                || "disabled".equalsIgnoreCase(properties.getTurnstileSecret())) {
            return;
        }
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Verificacion CAPTCHA requerida");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", properties.getTurnstileSecret());
        form.add("response", token);
        if (remoteIp != null && !remoteIp.isBlank()) {
            form.add("remoteip", remoteIp);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClientBuilder.build()
                .post()
                .uri(properties.getTurnstileVerifyUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
            throw new IllegalArgumentException("CAPTCHA invalido o expirado");
        }
    }
}
