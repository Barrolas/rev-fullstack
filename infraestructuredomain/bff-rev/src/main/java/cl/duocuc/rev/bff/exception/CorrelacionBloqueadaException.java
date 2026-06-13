package cl.duocuc.rev.bff.exception;

import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import java.util.List;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CorrelacionBloqueadaException extends RuntimeException {

    private final List<AsignacionActivaDto> asignacionesActivas;

    public CorrelacionBloqueadaException(String message, List<AsignacionActivaDto> asignacionesActivas) {
        super(message);
        this.asignacionesActivas = asignacionesActivas;
    }

    public HttpStatus getStatus() {
        return HttpStatus.CONFLICT;
    }
}
