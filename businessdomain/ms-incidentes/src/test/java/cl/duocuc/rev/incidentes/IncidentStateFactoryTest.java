package cl.duocuc.rev.incidentes;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.state.IncidentStateFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class IncidentStateFactoryTest {

    @Autowired
    private IncidentStateFactory stateFactory;

    @Test
    void enProgresoRequiereGeorreferenciacion() {
        Incidente incidente = Incidente.builder()
                .estado(EstadoIncidente.REPORTADO)
                .build();

        assertThrows(Exception.class,
                () -> stateFactory.validarTransicion(incidente, EstadoIncidente.EN_PROGRESO));
    }

    @Test
    void enProgresoConGeoEsValido() {
        Incidente incidente = Incidente.builder()
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.45)
                .lng(-70.66)
                .build();

        assertDoesNotThrow(() -> stateFactory.validarTransicion(incidente, EstadoIncidente.EN_PROGRESO));
    }

    @Test
    void enProgresoPermiteControladoOEscalado() {
        Incidente incidente = Incidente.builder()
                .estado(EstadoIncidente.EN_PROGRESO)
                .lat(-33.45)
                .lng(-70.66)
                .build();

        assertDoesNotThrow(() -> stateFactory.validarTransicion(incidente, EstadoIncidente.CONTROLADO));
        assertDoesNotThrow(() -> stateFactory.validarTransicion(incidente, EstadoIncidente.ESCALADO));
    }

    @Test
    void reportadoNoSaltaDirectoAControlado() {
        Incidente incidente = Incidente.builder()
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.45)
                .lng(-70.66)
                .build();

        assertThrows(Exception.class,
                () -> stateFactory.validarTransicion(incidente, EstadoIncidente.CONTROLADO));
    }

    @Test
    void controladoSoloPermiteCerrado() {
        Incidente incidente = Incidente.builder()
                .estado(EstadoIncidente.CONTROLADO)
                .build();

        assertDoesNotThrow(() -> stateFactory.validarTransicion(incidente, EstadoIncidente.CERRADO));
        assertThrows(Exception.class,
                () -> stateFactory.validarTransicion(incidente, EstadoIncidente.EN_PROGRESO));
    }
}
