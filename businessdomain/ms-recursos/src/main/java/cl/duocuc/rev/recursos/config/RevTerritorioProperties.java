package cl.duocuc.rev.recursos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rev.territorio")
public record RevTerritorioProperties(int regionCodigoCasen, String regionNombre) {}
