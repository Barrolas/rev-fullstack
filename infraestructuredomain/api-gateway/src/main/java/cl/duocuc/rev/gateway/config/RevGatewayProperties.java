package cl.duocuc.rev.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "rev.gateway")
public class RevGatewayProperties {

    /** URL del endpoint de roles (sin load balancer en perfil docker). */
    private String keycloakRolesUrl = "http://KEYCLOAK-ADAPTER/roles";
}
