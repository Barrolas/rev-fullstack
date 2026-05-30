package cl.duocuc.rev.incidentes.state;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class IncidentStateFactory {

    private final Map<EstadoIncidente, IncidentStateHandler> handlers;

    public IncidentStateFactory(List<IncidentStateHandler> handlerList) {
        handlers = new EnumMap<>(EstadoIncidente.class);
        for (IncidentStateHandler handler : handlerList) {
            handlers.put(handler.getEstado(), handler);
        }
    }

    public void validarTransicion(Incidente incidente, EstadoIncidente destino) {
        IncidentStateHandler handler = handlers.get(incidente.getEstado());
        if (handler == null) {
            throw new BusinessRuleException("STATE_FINAL",
                    "El incidente no admite mas transiciones",
                    HttpStatus.BAD_REQUEST);
        }
        handler.validarTransicion(incidente, destino);
    }
}
