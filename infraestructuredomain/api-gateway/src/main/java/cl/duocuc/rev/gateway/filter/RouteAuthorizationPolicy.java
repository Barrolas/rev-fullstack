package cl.duocuc.rev.gateway.filter;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class RouteAuthorizationPolicy {

    private static final List<String> OPERADOR_ROLES = List.of("Despachador", "Admin");

    public void checkWriteAccess(String method, String path, List<String> roles) {
        if (isReadOnly(method)) {
            return;
        }
        if (path.startsWith("/api/brigadista/")) {
            if (!roles.contains("Brigadista") && !hasOperadorRole(roles)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rol Brigadista u operador requerido");
            }
            return;
        }
        if (isOperadorOnlyWrite(path, method) && !hasOperadorRole(roles)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Solo Despachador o Admin pueden realizar esta operación");
        }
    }

    private boolean isReadOnly(String method) {
        String m = method.toUpperCase(Locale.ROOT);
        return HttpMethod.GET.name().equals(m) || HttpMethod.HEAD.name().equals(m) || HttpMethod.OPTIONS.name().equals(m);
    }

    private boolean hasOperadorRole(List<String> roles) {
        return roles.stream().anyMatch(OPERADOR_ROLES::contains);
    }

    private boolean isOperadorOnlyWrite(String path, String method) {
        if (path.startsWith("/api/despacho/")) {
            return true;
        }
        if (path.startsWith("/api/incidentes") && !path.contains("/timeline")) {
            return true;
        }
        if (path.startsWith("/api/correlaciones")) {
            return true;
        }
        if (path.startsWith("/api/zonas") && !HttpMethod.GET.name().equalsIgnoreCase(method)) {
            return true;
        }
        if (path.startsWith("/api/recursos") && !HttpMethod.GET.name().equalsIgnoreCase(method)) {
            return true;
        }
        return false;
    }
}
