package cl.duocuc.rev.bff.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.security.AuthorizationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

class BffExceptionHandlerTest {

    private final BffExceptionHandler handler = new BffExceptionHandler();

    @Test
    void handleAuthorization_retornaForbidden() {
        var response = handler.handleAuthorization(
                new AuthorizationException("Sin permiso", HttpStatus.FORBIDDEN));

        assertEquals(403, response.getStatusCode().value());
        assertEquals("Sin permiso", response.getBody().get("error"));
    }

    @Test
    void handleCorrelacionBloqueada_incluyeAsignaciones() {
        var ex = new CorrelacionBloqueadaException(
                "Bloqueado", List.of(AsignacionActivaDto.builder().id(1L).build()));
        var response = handler.handleCorrelacionBloqueada(ex);

        assertEquals("CORRELACION_BLOQUEADA_DESPACHO", response.getBody().get("code"));
        assertNotNull(response.getBody().get("asignacionesActivas"));
    }

    @Test
    void handleIllegalArgument_retorna400() {
        var response = handler.handleIllegalArgument(new IllegalArgumentException("dato invalido"));
        assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void handleWebClientResponse_404_retornaServicioNoDisponible() {
        WebClientResponseException ex = WebClientResponseException.create(
                404, "Not Found", null, null, null);
        var response = handler.handleWebClientResponse(ex);
        assertEquals(503, response.getStatusCode().value());
    }

}
