package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.IncidenteTimelineItemDto;
import cl.duocuc.rev.bff.security.AuthorizationService;
import cl.duocuc.rev.bff.security.RevAuthContext;
import cl.duocuc.rev.bff.service.IncidenteFacadeService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidentes")
@RequiredArgsConstructor
public class IncidenteBffController {

    private final IncidenteFacadeService incidenteFacadeService;
    private final AuthorizationService authorizationService;

    @GetMapping("/{id}/timeline")
    public List<IncidenteTimelineItemDto> timeline(
            @PathVariable UUID id,
            @RequestHeader(value = "X-REV-Sub", required = false) String sub,
            @RequestHeader(value = "X-REV-Username", required = false) String username,
            @RequestHeader(value = "X-REV-Roles", required = false) String roles) {
        RevAuthContext auth = RevAuthContext.fromHeaders(sub, username, roles);
        if (auth.isBrigadista() && !auth.isOperador()) {
            var perfil = authorizationService.requireBrigadista(auth);
            authorizationService.requireAccesoIncidenteBrigada(perfil, id);
        }
        return incidenteFacadeService.timeline(id);
    }
}
