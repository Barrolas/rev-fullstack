package cl.duocuc.rev.bff.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "rev.public-report")
public class PublicReportProperties {

    private long minFormSeconds = 3;
    private String turnstileSecret = "";
    private String turnstileVerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    private String nominatimUrl = "https://nominatim.openstreetmap.org/search";
    private String nominatimUserAgent = "REV-Municipalidad-Valle/1.0";
}
