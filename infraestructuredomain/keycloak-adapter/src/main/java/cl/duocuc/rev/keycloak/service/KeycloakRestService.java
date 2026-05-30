package cl.duocuc.rev.keycloak.service;

import cl.duocuc.rev.keycloak.config.KeycloakProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class KeycloakRestService {

    private final RestTemplate restTemplate;
    private final KeycloakProperties keycloakProperties;

    public String login(String username, String password) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("username", username);
        body.add("password", password);
        body.add("client_id", keycloakProperties.getClientId());
        body.add("grant_type", keycloakProperties.getAuthorizationGrantType());
        body.add("client_secret", keycloakProperties.getClientSecret());
        body.add("scope", keycloakProperties.getScope());
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, new HttpHeaders());
        return restTemplate.postForObject(keycloakProperties.getTokenUri(), request, String.class);
    }

    public String refresh(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", keycloakProperties.getClientId());
        body.add("grant_type", keycloakProperties.getAuthorizationGrantTypeRefresh());
        body.add("refresh_token", refreshToken);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, new HttpHeaders());
        return restTemplate.postForObject(keycloakProperties.getTokenUri(), request, String.class);
    }

    public void logout(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", keycloakProperties.getClientId());
        body.add("client_secret", keycloakProperties.getClientSecret());
        body.add("refresh_token", refreshToken);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, new HttpHeaders());
        restTemplate.postForObject(keycloakProperties.getLogout(), request, String.class);
    }

    public void checkValidity(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, token);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        restTemplate.postForObject(keycloakProperties.getUserInfoUri(), request, String.class);
    }
}
