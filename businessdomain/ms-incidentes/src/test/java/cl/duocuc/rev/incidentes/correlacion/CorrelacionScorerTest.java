package cl.duocuc.rev.incidentes.correlacion;

import static org.assertj.core.api.Assertions.assertThat;

import cl.duocuc.rev.incidentes.config.CorrelacionProperties;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CorrelacionScorerTest {

    private CorrelacionScorer scorer;

    @BeforeEach
    void setUp() {
        CorrelacionProperties properties = new CorrelacionProperties();
        properties.setUmbralScore(60);
        CorrelacionProperties.ReglasTipo urbano = new CorrelacionProperties.ReglasTipo();
        urbano.setRadioMetros(400);
        urbano.setVentanaMinutos(90);
        properties.getTipos().put("URBANO", urbano);
        scorer = new CorrelacionScorer(properties);
    }

    @Test
    void mismaUbicacionYTiempoCorto_debePuntajeAlto() {
        LocalDateTime now = LocalDateTime.now();
        Incidente a = incidente(now, -33.5, -70.5, "URBANO");
        Incidente b = incidente(now.plusMinutes(5), -33.5, -70.5, "URBANO");

        CorrelacionScorer.ResultadoPuntaje resultado = scorer.calcular(a, b);

        assertThat(resultado.score()).isGreaterThanOrEqualTo(60);
        assertThat(resultado.distanciaMetros()).isLessThan(1.0);
    }

    @Test
    void ubicacionLejana_debePuntajeBajo() {
        LocalDateTime now = LocalDateTime.now();
        Incidente a = incidente(now, -33.5, -70.5, "URBANO");
        Incidente b = incidente(now.plusMinutes(5), -34.5, -71.5, "FORESTAL");

        CorrelacionScorer.ResultadoPuntaje resultado = scorer.calcular(a, b);

        assertThat(resultado.score()).isLessThan(60);
        assertThat(resultado.motivo().get("puntosDistancia")).isEqualTo(0);
        assertThat(resultado.motivo().get("puntosTipo")).isEqualTo(0);
    }

    private static Incidente incidente(LocalDateTime createdAt, double lat, double lng, String tipo) {
        return Incidente.builder()
                .id(UUID.randomUUID())
                .folio("REV-TEST-00001")
                .tipo(tipo)
                .estado(EstadoIncidente.REPORTADO)
                .lat(lat)
                .lng(lng)
                .descripcion("Prueba")
                .anonimo(true)
                .origenReporte(OrigenReporte.PUBLICO)
                .reportanteUuid(UUID.randomUUID())
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();
    }
}
