package cl.duocuc.rev.incidentes.state;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import org.springframework.stereotype.Component;

@Component
public class ControladoState extends BaseIncidentState {

    @Override
    public EstadoIncidente getEstado() {
        return EstadoIncidente.CONTROLADO;
    }

    @Override
    public void validarTransicion(Incidente incidente, EstadoIncidente destino) {
        if (destino == EstadoIncidente.CERRADO) {
            return;
        }
        deny(destino);
    }
}
