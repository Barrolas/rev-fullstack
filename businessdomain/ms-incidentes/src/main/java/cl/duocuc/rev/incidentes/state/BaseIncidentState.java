package cl.duocuc.rev.incidentes.state;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import org.springframework.http.HttpStatus;

abstract class BaseIncidentState implements IncidentStateHandler {

    protected void requireGeo(Incidente incidente) {
        if (incidente.getLat() == null || incidente.getLng() == null) {
            throw new BusinessRuleException("GEO_REQUIRED",
                    "Georreferenciacion obligatoria para esta transicion",
                    HttpStatus.PRECONDITION_FAILED);
        }
    }

    protected void deny(EstadoIncidente destino) {
        throw new BusinessRuleException("INVALID_TRANSITION",
                "Transicion no permitida hacia " + destino,
                HttpStatus.BAD_REQUEST);
    }
}
