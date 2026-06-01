package cl.duocuc.rev.keycloak.exception;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

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

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<ExceptionResponse> handleHttpClient(HttpClientErrorException ex) {
        HttpStatus status = ex.getStatusCode().value() == HttpStatus.UNAUTHORIZED.value()
                || ex.getStatusCode().value() == HttpStatus.BAD_REQUEST.value()
                        ? HttpStatus.UNAUTHORIZED
                        : HttpStatus.BAD_GATEWAY;
        String message = status == HttpStatus.UNAUTHORIZED
                ? "Usuario o clave incorrectos"
                : "Error del servicio de identidad";
        return ResponseEntity.status(status).body(
                ExceptionResponse.builder()
                        .code("KEYCLOAK_HTTP_ERROR")
                        .message(message)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ExceptionResponse> handleResourceAccess(ResourceAccessException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                ExceptionResponse.builder()
                        .code("IDENTITY_UNAVAILABLE")
                        .message("Servicio de identidad no disponible")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
