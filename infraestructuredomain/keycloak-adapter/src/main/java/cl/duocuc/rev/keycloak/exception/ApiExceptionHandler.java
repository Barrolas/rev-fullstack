package cl.duocuc.rev.keycloak.exception;

import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ExceptionResponse> handleBusiness(BusinessRuleException ex) {
        return ResponseEntity.status(ex.getStatus()).body(
                ExceptionResponse.builder()
                        .code(ex.getCode())
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
