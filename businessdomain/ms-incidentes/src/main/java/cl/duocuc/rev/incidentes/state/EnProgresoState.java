package cl.duocuc.rev.incidentes.state;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import org.springframework.stereotype.Component;

@Component
public class EnProgresoState extends BaseIncidentState {

    @Override
    public EstadoIncidente getEstado() {
        return EstadoIncidente.EN_PROGRESO;
    }

    @Override
    public void validarTransicion(Incidente incidente, EstadoIncidente destino) {
        if (destino == EstadoIncidente.CONTROLADO || destino == EstadoIncidente.ESCALADO) {
            return;
        }
        deny(destino);
    }
}
