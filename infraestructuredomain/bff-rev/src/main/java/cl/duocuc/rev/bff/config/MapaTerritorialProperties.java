package cl.duocuc.rev.bff.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "rev.mapa")
public class MapaTerritorialProperties {

    /** Radio de influencia mostrado en mapa (alineado a correlación ms-incidentes). */
    private int radioCorrelacionMetros = 500;
}
