package cl.duocuc.rev.bff.security;

import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.dto.BrigadistaOperativoDto;
import cl.duocuc.rev.bff.dto.PerfilOperativoDto;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final RecursosClientService recursosClientService;

    public void requireOperador(RevAuthContext auth) {
        if (auth == null || !auth.isOperador()) {
            throw new AuthorizationException(
                    "Solo Despachador o Admin pueden realizar esta operación", HttpStatus.FORBIDDEN);
        }
    }

    public BrigadistaOperativoDto requireBrigadista(RevAuthContext auth) {
        if (auth == null || !auth.isBrigadista()) {
            throw new AuthorizationException("Rol Brigadista requerido", HttpStatus.FORBIDDEN);
        }
        RecursosCatalogoDto.BrigadistaItemDto brigadista = resolverBrigadista(auth);
        if (brigadista.getIdBrigada() == null) {
            throw new AuthorizationException("El brigadista no pertenece a ninguna brigada activa", HttpStatus.FORBIDDEN);
        }
        RecursosDisponiblesDto.BrigadaItemDto brigada = recursosClientService.obtenerBrigadaResumen(brigadista.getIdBrigada());
        boolean esJefe = Boolean.TRUE.equals(brigadista.getEsJefe()) || "JEFE".equals(brigadista.getRolCodigo());
        return BrigadistaOperativoDto.builder()
                .brigadistaId(brigadista.getId())
                .brigadaId(brigadista.getIdBrigada())
                .brigadaNombre(brigada != null ? brigada.getNombre() : null)
                .brigadaCodigo(brigada != null ? brigada.getCodigo() : null)
                .rolCodigo(brigadista.getRolCodigo())
                .esJefe(esJefe)
                .username(auth.getUsername())
                .build();
    }

    public void requireJefe(BrigadistaOperativoDto perfil) {
        if (perfil == null || !perfil.isEsJefe()) {
            throw new AuthorizationException(
                    "Solo el jefe de brigada puede realizar esta operación", HttpStatus.FORBIDDEN);
        }
    }

    public PerfilOperativoDto resolverPerfil(RevAuthContext auth) {
        if (auth.isOperador()) {
            return PerfilOperativoDto.builder()
                    .operador(true)
                    .username(auth.getUsername())
                    .build();
        }
        if (auth.isBrigadista()) {
            try {
                RecursosCatalogoDto.BrigadistaItemDto b = resolverBrigadista(auth);
                RecursosDisponiblesDto.BrigadaItemDto brigada = b.getIdBrigada() != null
                        ? recursosClientService.obtenerBrigadaResumen(b.getIdBrigada())
                        : null;
                boolean esJefe = Boolean.TRUE.equals(b.getEsJefe()) || "JEFE".equals(b.getRolCodigo());
                return PerfilOperativoDto.builder()
                        .operador(false)
                        .brigadistaId(b.getId())
                        .brigadaId(b.getIdBrigada())
                        .brigadaNombre(brigada != null ? brigada.getNombre() : null)
                        .brigadaCodigo(brigada != null ? brigada.getCodigo() : null)
                        .rolCodigo(b.getRolCodigo())
                        .rolNombre(b.getRolNombre())
                        .esJefe(esJefe)
                        .puedeTransicionarIncidente(esJefe)
                        .username(auth.getUsername())
                        .nombre(b.getNombre())
                        .apellido(b.getApellido())
                        .build();
            } catch (Exception ex) {
                throw new AuthorizationException(
                        "Cuenta Brigadista sin vínculo operativo en ms-recursos", HttpStatus.FORBIDDEN);
            }
        }
        throw new AuthorizationException("Perfil no autorizado", HttpStatus.FORBIDDEN);
    }

    public void requireAccesoIncidenteBrigada(BrigadistaOperativoDto perfil, UUID incidenteId) {
        if (!recursosClientService.brigadaAsignadaAIncidente(perfil.getBrigadaId(), incidenteId)) {
            throw new AuthorizationException(
                    "El incidente no tiene asignación activa de su brigada", HttpStatus.FORBIDDEN);
        }
    }

    private RecursosCatalogoDto.BrigadistaItemDto resolverBrigadista(RevAuthContext auth) {
        if (auth.getSub() != null && !auth.getSub().isBlank()) {
            try {
                return recursosClientService.obtenerBrigadistaPorSub(UUID.fromString(auth.getSub())).block();
            } catch (Exception ignored) {
                // fallback username
            }
        }
        if (auth.getUsername() != null && !auth.getUsername().isBlank()) {
            return recursosClientService.obtenerBrigadistaPorUsername(auth.getUsername()).block();
        }
        throw new AuthorizationException("No se pudo resolver identidad del brigadista", HttpStatus.FORBIDDEN);
    }
}
