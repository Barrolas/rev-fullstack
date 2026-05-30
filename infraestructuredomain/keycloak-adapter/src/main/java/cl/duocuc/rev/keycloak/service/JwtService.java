package cl.duocuc.rev.keycloak.service;

import cl.duocuc.rev.keycloak.config.KeycloakProperties;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.UrlJwkProvider;
import java.net.URI;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final KeycloakProperties keycloakProperties;

    public Jwk getJwk(String kid) throws Exception {
        URL url = URI.create(keycloakProperties.getJwkSetUri()).toURL();
        UrlJwkProvider provider = new UrlJwkProvider(url);
        String certsId = keycloakProperties.getCertsId();
        if (certsId != null && !certsId.isBlank()) {
            return provider.get(certsId.trim());
        }
        return provider.get(kid);
    }
}
