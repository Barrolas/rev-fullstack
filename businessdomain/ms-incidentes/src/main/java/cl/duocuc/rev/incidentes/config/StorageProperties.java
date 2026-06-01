package cl.duocuc.rev.incidentes.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "rev.storage")
public class StorageProperties {

    private String path = "./data/incidente-adjuntos";
    private long maxPhotoBytes = 5_242_880L;
    private long maxVideoBytes = 52_428_800L;
}
