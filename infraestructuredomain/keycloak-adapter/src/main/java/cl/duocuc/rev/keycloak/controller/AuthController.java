package cl.duocuc.rev.keycloak.controller;

import cl.duocuc.rev.keycloak.exception.BusinessRuleException;
import cl.duocuc.rev.keycloak.service.JwtService;
import cl.duocuc.rev.keycloak.dto.RegisterRequest;
import cl.duocuc.rev.keycloak.dto.RegisterResponse;
import cl.duocuc.rev.keycloak.dto.TokenResponse;
import cl.duocuc.rev.keycloak.service.KeycloakAdminService;
import cl.duocuc.rev.keycloak.service.KeycloakRestService;
import com.auth0.jwk.Jwk;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final KeycloakRestService keycloakRestService;
    private final JwtService jwtService;
    private final KeycloakAdminService keycloakAdminService;

    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> getRoles(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer", "").trim();
            DecodedJWT jwt = JWT.decode(token);
            Jwk jwk = jwtService.getJwk(jwt.getKeyId());
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
            algorithm.verify(jwt);

            if (jwt.getExpiresAt().before(new Date())) {
                throw new BusinessRuleException("TOKEN_EXPIRED", "Token expirado", HttpStatus.FORBIDDEN);
            }

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) jwt.getClaim("realm_access").asMap().get("roles");
            Map<String, Object> response = new HashMap<>();
            for (String role : roles) {
                response.put(role, role.length());
            }
            return ResponseEntity.ok(response);
        } catch (BusinessRuleException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error validando roles: {}", ex.getMessage());
            throw new BusinessRuleException("AUTH_ERROR", ex.getMessage(), HttpStatus.FORBIDDEN);
        }
    }

    @GetMapping("/valid")
    public ResponseEntity<Map<String, String>> valid(@RequestHeader("Authorization") String authHeader) {
        try {
            keycloakRestService.checkValidity(authHeader);
            return ResponseEntity.ok(Map.of("is_valid", "true"));
        } catch (Exception ex) {
            throw new BusinessRuleException("INVALID", "Token no valido", HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TokenResponse> login(
            @RequestParam("username") String username,
            @RequestParam("password") String password) {
        return ResponseEntity.ok(keycloakRestService.login(username, password));
    }

    @PostMapping(value = "/logout", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> logout(@RequestParam("refresh_token") String refreshToken) {
        keycloakRestService.logout(refreshToken);
        return ResponseEntity.ok(Map.of("logout", "true"));
    }

    @PostMapping(value = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TokenResponse> refresh(@RequestParam("refresh_token") String refreshToken) {
        return ResponseEntity.ok(keycloakRestService.refresh(refreshToken));
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(keycloakAdminService.registerCiudadano(request));
    }
}
