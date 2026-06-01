package cl.duocuc.rev.incidentes;

import cl.duocuc.rev.incidentes.config.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class MsIncidentesApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsIncidentesApplication.class, args);
    }
}
