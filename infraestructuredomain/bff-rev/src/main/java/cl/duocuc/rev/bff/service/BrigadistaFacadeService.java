package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadistaOperativoDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.TransicionIncidenteRequest;
import cl.duocuc.rev.bff.security.AuthorizationException;
import cl.duocuc.rev.bff.security.AuthorizationService;
import cl.duocuc.rev.bff.security.RevAuthContext;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BrigadistaFacadeService {

    private static final Set<String> TRANSICIONES_JEFE = Set.of("EN_PROGRESO", "CONTROLADO");

    private final AuthorizationService authorizationService;
    private final RecursosClientService recursosClientService;
    private final IncidenteClientService incidenteClientService;
    private final DashboardFacadeService dashboardFacadeService;

    public List<AsignacionActivaDto> misAsignaciones(RevAuthContext auth) {
        BrigadistaOperativoDto perfil = authorizationService.requireBrigadista(auth);
        return recursosClientService.listarAsignacionesPorBrigada(perfil.getBrigadaId()).block();
    }

    public BrigadaDetalleDto miBrigada(RevAuthContext auth) {
        BrigadistaOperativoDto perfil = authorizationService.requireBrigadista(auth);
        return recursosClientService.obtenerBrigada(perfil.getBrigadaId()).block();
    }

    public DashboardResponse incidenteAsignado(RevAuthContext auth, UUID incidenteId) {
        BrigadistaOperativoDto perfil = authorizationService.requireBrigadista(auth);
        authorizationService.requireAccesoIncidenteBrigada(perfil, incidenteId);
        return dashboardFacadeService.obtenerPorIncidenteId(incidenteId);
    }

    public AsignacionActivaDto avanzarEstadoDespacho(
            RevAuthContext auth, Long asignacionId, ActualizarEstadoDespachoRequest request) {
        BrigadistaOperativoDto perfil = authorizationService.requireBrigadista(auth);
        authorizationService.requireJefe(perfil);
        AsignacionActivaDto asignacion = recursosClientService.obtenerAsignacionActiva(asignacionId).block();
        if (asignacion == null || !perfil.getBrigadaId().equals(asignacion.getBrigadaId())) {
            throw new AuthorizationException("Asignación no pertenece a su brigada", HttpStatus.FORBIDDEN);
        }
        return recursosClientService.actualizarEstadoDespacho(asignacionId, request).block();
    }

    public IncidenteDto transicionarIncidente(
            RevAuthContext auth, UUID incidenteId, TransicionIncidenteRequest request) {
        BrigadistaOperativoDto perfil = authorizationService.requireBrigadista(auth);
        authorizationService.requireJefe(perfil);
        authorizationService.requireAccesoIncidenteBrigada(perfil, incidenteId);
        String destino = request.getEstadoDestino();
        if (destino == null || !TRANSICIONES_JEFE.contains(destino)) {
            throw new AuthorizationException(
                    "Transición no permitida para jefe de brigada: " + destino, HttpStatus.FORBIDDEN);
        }
        return incidenteClientService.transicionarConAuditoria(
                incidenteId, destino, auth.getUsername(), "JEFE_BRIGADA").block();
    }
}
