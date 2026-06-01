package cl.duocuc.rev.keycloak.service;

import cl.duocuc.rev.keycloak.config.KeycloakAdminProperties;
import cl.duocuc.rev.keycloak.dto.RegisterRequest;
import cl.duocuc.rev.keycloak.dto.RegisterResponse;
import cl.duocuc.rev.keycloak.exception.BusinessRuleException;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private final RestTemplate restTemplate;
    private final KeycloakAdminProperties adminProperties;

    public RegisterResponse registerCiudadano(RegisterRequest request) {
        validate(request);
        String adminToken = obtainAdminToken();

        Map<String, Object> body = new HashMap<>();
        body.put("username", request.getUsername());
        body.put("enabled", true);
        body.put("email", request.getEmail());
        body.put("firstName", request.getFirstName());
        body.put("lastName", request.getLastName());
        body.put("emailVerified", true);
        body.put("attributes", Map.of("rut", List.of(request.getRut() != null ? request.getRut() : "")));
        body.put("credentials", List.of(Map.of(
                "type", "password",
                "value", request.getPassword(),
                "temporary", false)));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String usersUrl = adminProperties.getServerUrl() + "/admin/realms/" + adminProperties.getRealm() + "/users";
        ResponseEntity<Void> createResponse = restTemplate.exchange(
                usersUrl, HttpMethod.POST, new HttpEntity<>(body, headers), Void.class);

        if (!createResponse.getStatusCode().is2xxSuccessful()) {
            throw new BusinessRuleException("REGISTER_FAILED", "No se pudo crear el usuario", HttpStatus.BAD_REQUEST);
        }

        UUID userId = extractUserId(createResponse.getHeaders().getLocation());
        assignRealmRole(adminToken, userId, "Ciudadano");

        return RegisterResponse.builder().userId(userId).username(request.getUsername()).build();
    }

    private void assignRealmRole(String adminToken, UUID userId, String roleName) {
        String roleUrl = adminProperties.getServerUrl() + "/admin/realms/" + adminProperties.getRealm()
                + "/roles/" + roleName;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        ResponseEntity<JsonNode> roleResponse = restTemplate.exchange(
                roleUrl, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);
        JsonNode role = roleResponse.getBody();
        if (role == null) {
            throw new BusinessRuleException("ROLE_NOT_FOUND", "Rol Ciudadano no encontrado", HttpStatus.BAD_REQUEST);
        }

        String mappingUrl = adminProperties.getServerUrl() + "/admin/realms/" + adminProperties.getRealm()
                + "/users/" + userId + "/role-mappings/realm";
        restTemplate.exchange(
                mappingUrl,
                HttpMethod.POST,
                new HttpEntity<>(List.of(role), headers),
                Void.class);
    }

    private String obtainAdminToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", adminProperties.getClientId());
        form.add("username", adminProperties.getUsername());
        form.add("password", adminProperties.getPassword());

        String tokenUrl = adminProperties.getServerUrl() + "/realms/" + adminProperties.getMasterRealm()
                + "/protocol/openid-connect/token";
        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                tokenUrl, new HttpEntity<>(form, tokenHeaders), JsonNode.class);
        JsonNode body = response.getBody();
        if (body == null || body.get("access_token") == null) {
            throw new BusinessRuleException("ADMIN_AUTH", "No se pudo autenticar admin Keycloak", HttpStatus.SERVICE_UNAVAILABLE);
        }
        return body.get("access_token").asText();
    }

    private static UUID extractUserId(URI location) {
        if (location == null) {
            return UUID.randomUUID();
        }
        String path = location.getPath();
        String idPart = path.substring(path.lastIndexOf('/') + 1);
        return UUID.fromString(idPart);
    }

    private static void validate(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BusinessRuleException("VALIDATION", "Usuario y clave validos son obligatorios", HttpStatus.BAD_REQUEST);
        }
    }
}
