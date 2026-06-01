package cl.duocuc.rev.bff;

import cl.duocuc.rev.bff.config.PublicReportProperties;
import java.time.Duration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@SpringBootApplication
@EnableDiscoveryClient
@EnableConfigurationProperties(PublicReportProperties.class)
public class BffRevApplication {

    public static void main(String[] args) {
        SpringApplication.run(BffRevApplication.class, args);
    }

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        HttpClient httpClient = HttpClient.create().responseTimeout(Duration.ofSeconds(120));
        return WebClient.builder().clientConnector(new ReactorClientHttpConnector(httpClient));
    }
}
