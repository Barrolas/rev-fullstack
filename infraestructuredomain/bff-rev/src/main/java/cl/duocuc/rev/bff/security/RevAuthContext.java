package cl.duocuc.rev.bff.security;

import java.util.Arrays;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RevAuthContext {
    private String sub;
    private String username;
    private List<String> roles;

    public boolean isAdmin() {
        return roles != null && roles.contains("Admin");
    }

    public boolean isDespachador() {
        return roles != null && roles.contains("Despachador");
    }

    public boolean isBrigadista() {
        return roles != null && roles.contains("Brigadista");
    }

    public boolean isOperador() {
        return isAdmin() || isDespachador();
    }

    public static RevAuthContext fromHeaders(String sub, String username, String rolesHeader) {
        List<String> roles = rolesHeader == null || rolesHeader.isBlank()
                ? List.of()
                : Arrays.stream(rolesHeader.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
        return RevAuthContext.builder()
                .sub(sub)
                .username(username)
                .roles(roles)
                .build();
    }
}
