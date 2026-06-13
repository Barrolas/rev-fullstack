package cl.duocuc.rev.bff.exception;

import cl.duocuc.rev.bff.security.AuthorizationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentConversionNotSupportedException;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@RestControllerAdvice
public class BffExceptionHandler {

    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthorization(AuthorizationException ex) {
        return ResponseEntity.status(ex.getStatus()).body(errorBody(ex.getStatus(), ex.getMessage()));
    }

    @ExceptionHandler(CorrelacionBloqueadaException.class)
    public ResponseEntity<Map<String, Object>> handleCorrelacionBloqueada(CorrelacionBloqueadaException ex) {
        Map<String, Object> body = new HashMap<>(errorBody(ex.getStatus(), ex.getMessage()));
        body.put("code", "CORRELACION_BLOQUEADA_DESPACHO");
        body.put("asignacionesActivas", ex.getAsignacionesActivas());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(errorBody(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    @ExceptionHandler({JsonProcessingException.class, MethodArgumentConversionNotSupportedException.class})
    public ResponseEntity<Map<String, Object>> handleInvalidPayload(Exception ex) {
        return ResponseEntity.badRequest().body(errorBody(
                HttpStatus.BAD_REQUEST,
                "Datos del reporte invalidos. Recargue la pagina e intente nuevamente."));
    }

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleWebClientResponse(WebClientResponseException ex) {
        String body = ex.getResponseBodyAsString();
        if (ex.getStatusCode().is4xxClientError() && body != null && !body.isBlank()
                && (body.contains("\"code\"") || body.contains("\"message\""))) {
            HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
            return ResponseEntity.status(status).body(errorBody(status, extractRemoteMessage(body, ex.getStatusText())));
        }
        if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorBody(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "El microservicio aun no esta disponible en Eureka. Intente nuevamente en unos segundos."));
        }
        String message = ex.getStatusCode().is4xxClientError()
                ? "No se pudo completar la operacion: " + extractRemoteMessage(body, ex.getStatusText())
                : "Un servicio interno respondio con error. Intente nuevamente en unos minutos.";
        HttpStatus status = ex.getStatusCode().is5xxServerError()
                ? HttpStatus.SERVICE_UNAVAILABLE
                : HttpStatus.valueOf(ex.getStatusCode().value());
        return ResponseEntity.status(status).body(errorBody(status, message));
    }

    private static String extractRemoteMessage(String body, String fallback) {
        if (body == null || body.isBlank()) {
            return fallback;
        }
        int msgIdx = body.indexOf("\"message\"");
        if (msgIdx >= 0) {
            int start = body.indexOf(':', msgIdx) + 1;
            int q1 = body.indexOf('"', start);
            if (q1 >= 0) {
                int q2 = body.indexOf('"', q1 + 1);
                if (q2 > q1) {
                    return body.substring(q1 + 1, q2);
                }
            }
        }
        return fallback;
    }

    @ExceptionHandler(WebClientRequestException.class)
    public ResponseEntity<Map<String, Object>> handleWebClientRequest(WebClientRequestException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorBody(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No se pudo conectar con un microservicio. Verifique que Eureka y los MS esten en ejecucion."));
    }

    private static Map<String, Object> errorBody(HttpStatus status, String message) {
        return errorBody(status.value(), message);
    }

    private static Map<String, Object> errorBody(int status, String message) {
        return Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", status,
                "error", message);
    }
}
