package cl.duocuc.rev.keycloak;

import cl.duocuc.rev.keycloak.config.KeycloakAdminProperties;
import cl.duocuc.rev.keycloak.config.KeycloakProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@EnableConfigurationProperties({KeycloakProperties.class, KeycloakAdminProperties.class})
@SpringBootApplication
public class KeycloakAdapterApplication {

    public static void main(String[] args) {
        SpringApplication.run(KeycloakAdapterApplication.class, args);
    }
}
