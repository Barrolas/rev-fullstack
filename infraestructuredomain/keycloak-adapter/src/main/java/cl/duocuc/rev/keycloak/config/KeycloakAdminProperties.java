package cl.duocuc.rev.keycloak.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "keycloak.admin")
public class KeycloakAdminProperties {

    private String serverUrl = "http://localhost:8090";
    private String realm = "rev";
    private String masterRealm = "master";
    private String username = "admin";
    private String password = "admin";
    private String clientId = "admin-cli";
}
