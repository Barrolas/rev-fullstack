package cl.duocuc.rev.recursos.exception;

import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ExceptionResponse> handle(BusinessRuleException ex) {
        return ResponseEntity.status(ex.getStatus()).body(
                ExceptionResponse.builder()
                        .code(ex.getCode())
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError()
                .body(ExceptionResponse.builder()
                        .code("ERROR_INTERNO")
                        .message(ex.getMessage() != null ? ex.getMessage() : "Error interno")
                        .timestamp(LocalDateTime.now())
                        .build());
    }
}
