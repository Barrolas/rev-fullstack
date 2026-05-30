package cl.duocuc.rev.recursos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class MsRecursosApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsRecursosApplication.class, args);
    }
}
