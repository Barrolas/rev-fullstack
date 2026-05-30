package cl.duocuc.rev.incidentes.state;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import org.springframework.stereotype.Component;

@Component
public class ReportadoState extends BaseIncidentState {

    @Override
    public EstadoIncidente getEstado() {
        return EstadoIncidente.REPORTADO;
    }

    @Override
    public void validarTransicion(Incidente incidente, EstadoIncidente destino) {
        if (destino == EstadoIncidente.EN_PROGRESO) {
            requireGeo(incidente);
            return;
        }
        deny(destino);
    }
}
