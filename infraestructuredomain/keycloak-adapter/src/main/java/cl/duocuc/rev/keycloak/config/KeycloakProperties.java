package cl.duocuc.rev.keycloak.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakProperties {

    private String tokenUri;
    private String userInfoUri;
    private String logout;
    private String jwkSetUri;
    private String certsId = "";
    private String clientId;
    private String clientSecret;
    private String scope;
    private String authorizationGrantType;
    private String authorizationGrantTypeRefresh;
}
