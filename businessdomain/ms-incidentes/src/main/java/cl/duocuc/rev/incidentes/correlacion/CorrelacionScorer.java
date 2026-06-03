package cl.duocuc.rev.incidentes.correlacion;

import cl.duocuc.rev.incidentes.config.CorrelacionProperties;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class CorrelacionScorer {

    private final CorrelacionProperties properties;

    public CorrelacionScorer(CorrelacionProperties properties) {
        this.properties = properties;
    }

    public ResultadoPuntaje calcular(Incidente origen, Incidente candidato) {
        CorrelacionProperties.ReglasTipo reglas = properties.reglasPara(origen.getTipo());
        double distancia = GeoUtils.haversineMetros(
                origen.getLat(), origen.getLng(), candidato.getLat(), candidato.getLng());
        long deltaMinutos = Math.abs(Duration.between(origen.getCreatedAt(), candidato.getCreatedAt()).toMinutes());

        int puntosDistancia = puntosProximidad(distancia, reglas.getRadioMetros());
        int puntosTiempo = puntosVentanaTemporal(deltaMinutos, reglas.getVentanaMinutos());
        int puntosTipo = origen.getTipo().equalsIgnoreCase(candidato.getTipo()) ? 20 : 0;
        int puntosPublico = origen.getOrigenReporte() == OrigenReporte.PUBLICO
                        && candidato.getOrigenReporte() == OrigenReporte.PUBLICO
                ? 10
                : 0;

        int score = puntosDistancia + puntosTiempo + puntosTipo + puntosPublico;

        Map<String, Object> motivo = new LinkedHashMap<>();
        motivo.put("distanciaMetros", Math.round(distancia));
        motivo.put("deltaMinutos", deltaMinutos);
        motivo.put("radioMetros", reglas.getRadioMetros());
        motivo.put("ventanaMinutos", reglas.getVentanaMinutos());
        motivo.put("puntosDistancia", puntosDistancia);
        motivo.put("puntosTiempo", puntosTiempo);
        motivo.put("puntosTipo", puntosTipo);
        motivo.put("puntosPublico", puntosPublico);
        motivo.put("score", score);

        return new ResultadoPuntaje(score, distancia, (int) deltaMinutos, motivo);
    }

    private static int puntosProximidad(double distanciaMetros, int radioMetros) {
        if (distanciaMetros >= radioMetros) {
            return 0;
        }
        double ratio = 1.0 - (distanciaMetros / radioMetros);
        return (int) Math.round(50.0 * ratio);
    }

    private static int puntosVentanaTemporal(long deltaMinutos, int ventanaMinutos) {
        if (deltaMinutos > ventanaMinutos) {
            return 0;
        }
        if (deltaMinutos <= 15) {
            return 30;
        }
        double ratio = 1.0 - ((double) (deltaMinutos - 15) / (ventanaMinutos - 15));
        return (int) Math.round(30.0 * Math.max(0, ratio));
    }

    public record ResultadoPuntaje(int score, double distanciaMetros, int deltaMinutos, Map<String, Object> motivo) {
    }
}
