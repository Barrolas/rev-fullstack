package cl.duocuc.rev.keycloak.service;

import cl.duocuc.rev.keycloak.config.KeycloakProperties;
import cl.duocuc.rev.keycloak.dto.TokenResponse;
import cl.duocuc.rev.keycloak.exception.BusinessRuleException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class KeycloakRestService {

    private final RestTemplate restTemplate;
    private final KeycloakProperties keycloakProperties;
    private final ObjectMapper objectMapper;

    public TokenResponse login(String username, String password) {
        MultiValueMap<String, String> body = tokenRequestBody(username, password);
        return postToken(body);
    }

    public TokenResponse refresh(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", keycloakProperties.getClientId());
        body.add("grant_type", keycloakProperties.getAuthorizationGrantTypeRefresh());
        body.add("refresh_token", refreshToken);
        body.add("client_secret", keycloakProperties.getClientSecret());
        return postToken(body);
    }

    public void logout(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", keycloakProperties.getClientId());
        body.add("client_secret", keycloakProperties.getClientSecret());
        body.add("refresh_token", refreshToken);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, new HttpHeaders());
        try {
            restTemplate.postForObject(keycloakProperties.getLogout(), request, String.class);
        } catch (HttpClientErrorException ex) {
            throw mapKeycloakClientError(ex);
        } catch (ResourceAccessException ex) {
            throw identityUnavailable(ex);
        }
    }

    public void checkValidity(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, token);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        try {
            restTemplate.postForObject(keycloakProperties.getUserInfoUri(), request, String.class);
        } catch (HttpClientErrorException ex) {
            throw mapKeycloakClientError(ex);
        } catch (ResourceAccessException ex) {
            throw identityUnavailable(ex);
        }
    }

    private MultiValueMap<String, String> tokenRequestBody(String username, String password) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("username", username);
        body.add("password", password);
        body.add("client_id", keycloakProperties.getClientId());
        body.add("grant_type", keycloakProperties.getAuthorizationGrantType());
        body.add("client_secret", keycloakProperties.getClientSecret());
        body.add("scope", keycloakProperties.getScope());
        return body;
    }

    private TokenResponse postToken(MultiValueMap<String, String> body) {
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, new HttpHeaders());
        try {
            String raw = restTemplate.postForObject(keycloakProperties.getTokenUri(), request, String.class);
            if (raw == null || raw.isBlank()) {
                throw new BusinessRuleException(
                        "TOKEN_EMPTY", "Keycloak no devolvio token", HttpStatus.BAD_GATEWAY);
            }
            return objectMapper.readValue(raw, TokenResponse.class);
        } catch (HttpClientErrorException ex) {
            throw mapKeycloakClientError(ex);
        } catch (ResourceAccessException ex) {
            throw identityUnavailable(ex);
        } catch (BusinessRuleException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessRuleException(
                    "TOKEN_PARSE_ERROR",
                    "Respuesta de identidad invalida",
                    HttpStatus.BAD_GATEWAY,
                    ex);
        }
    }

    private BusinessRuleException mapKeycloakClientError(HttpClientErrorException ex) {
        if (ex.getStatusCode().value() == HttpStatus.UNAUTHORIZED.value()
                || ex.getStatusCode().value() == HttpStatus.BAD_REQUEST.value()) {
            return new BusinessRuleException(
                    "INVALID_CREDENTIALS",
                    "Usuario o clave incorrectos",
                    HttpStatus.UNAUTHORIZED,
                    ex);
        }
        return new BusinessRuleException(
                "KEYCLOAK_ERROR",
                "Error del servicio de identidad",
                HttpStatus.valueOf(ex.getStatusCode().value()),
                ex);
    }

    private BusinessRuleException identityUnavailable(ResourceAccessException ex) {
        return new BusinessRuleException(
                "IDENTITY_UNAVAILABLE",
                "Servicio de identidad no disponible",
                HttpStatus.SERVICE_UNAVAILABLE,
                ex);
    }
}
