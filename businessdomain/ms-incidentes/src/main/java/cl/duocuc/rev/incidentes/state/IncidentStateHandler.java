package cl.duocuc.rev.incidentes.state;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;

public interface IncidentStateHandler {

    EstadoIncidente getEstado();

    void validarTransicion(Incidente incidente, EstadoIncidente destino);
}
