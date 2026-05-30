package cl.duocuc.rev.zonas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class MsZonasRiesgoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsZonasRiesgoApplication.class, args);
    }
}
