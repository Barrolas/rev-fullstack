package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.PerfilOperativoDto;
import cl.duocuc.rev.bff.security.AuthorizationService;
import cl.duocuc.rev.bff.security.RevAuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final AuthorizationService authorizationService;

    @GetMapping("/operativo")
    public PerfilOperativoDto operativo(
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        RevAuthContext auth = RevAuthContext.fromHeaders(sub, username, roles);
        return authorizationService.resolverPerfil(auth);
    }
}
