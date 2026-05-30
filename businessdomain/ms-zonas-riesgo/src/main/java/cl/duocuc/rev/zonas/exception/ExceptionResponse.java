package cl.duocuc.rev.zonas.exception;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExceptionResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
}
