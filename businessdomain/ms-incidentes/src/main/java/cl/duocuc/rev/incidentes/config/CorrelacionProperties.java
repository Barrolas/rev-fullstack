package cl.duocuc.rev.incidentes.config;

import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "rev.correlacion")
public class CorrelacionProperties {

    private int umbralScore = 60;
    private int defaultRadioMetros = 500;
    private int defaultVentanaMinutos = 90;
    private Map<String, ReglasTipo> tipos = new HashMap<>();

    public ReglasTipo reglasPara(String tipo) {
        if (tipo == null) {
            return defaults();
        }
        ReglasTipo reglas = tipos.get(tipo.toUpperCase());
        return reglas != null ? reglas : defaults();
    }

    private ReglasTipo defaults() {
        ReglasTipo reglas = new ReglasTipo();
        reglas.setRadioMetros(defaultRadioMetros);
        reglas.setVentanaMinutos(defaultVentanaMinutos);
        return reglas;
    }

    @Getter
    @Setter
    public static class ReglasTipo {
        private int radioMetros;
        private int ventanaMinutos;
    }
}
