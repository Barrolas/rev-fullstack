package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.CorrelacionClientService;
import cl.duocuc.rev.bff.dto.ConfirmarCorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionResumenDto;
import cl.duocuc.rev.bff.dto.DescartarCorrelacionDto;
import cl.duocuc.rev.bff.dto.GrupoIncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteResumenDto;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CorrelacionFacadeService {

    private final CorrelacionClientService correlacionClientService;

    public List<CorrelacionDto> listarPendientes() {
        List<CorrelacionDto> list = correlacionClientService.listarPendientes().block();
        return list != null ? list : List.of();
    }

    public long contarPendientes() {
        return listarPendientes().size();
    }

    public GrupoIncidenteDto obtenerGrupo(UUID incidenteId) {
        return correlacionClientService.obtenerGrupo(incidenteId).block();
    }

    public List<CorrelacionDto> listarPorIncidente(UUID incidenteId) {
        List<CorrelacionDto> list = correlacionClientService.listarPorIncidente(incidenteId).block();
        return list != null ? list : List.of();
    }

    public IncidenteResumenDto obtenerPorFolio(String folio) {
        return correlacionClientService.obtenerPorFolio(folio).block();
    }

    public CorrelacionDto confirmar(UUID correlacionId, ConfirmarCorrelacionDto request, String usuario) {
        return correlacionClientService.confirmar(correlacionId, request, usuario).block();
    }

    public CorrelacionDto descartar(UUID correlacionId, DescartarCorrelacionDto request, String usuario) {
        return correlacionClientService.descartar(correlacionId, request, usuario).block();
    }

    public void enriquecerIncidente(IncidenteDto incidente, Map<UUID, CorrelacionResumenDto> resumenes) {
        if (incidente == null || incidente.getId() == null) {
            return;
        }
        CorrelacionResumenDto resumen = resumenes.get(incidente.getId());
        if (resumen == null) {
            return;
        }
        incidente.setIncidenteCanonicoId(resumen.getIncidenteCanonicoId());
        incidente.setFolioCanonico(resumen.getFolioCanonico());
        incidente.setEsCanonico(resumen.isEsCanonico());
        incidente.setCantidadReportesVinculados(resumen.getCantidadReportesVinculados());
        incidente.setSugerenciasPendientes(resumen.getSugerenciasPendientes());
        incidente.setScoreMaximoPendiente(resumen.getScoreMaximoPendiente());
    }

    public Map<UUID, CorrelacionResumenDto> cargarResumenes(List<UUID> incidenteIds) {
        if (incidenteIds == null || incidenteIds.isEmpty()) {
            return Map.of();
        }
        List<CorrelacionResumenDto> resumenes = correlacionClientService.resumenes(incidenteIds).block();
        if (resumenes == null) {
            return Map.of();
        }
        return resumenes.stream()
                .collect(Collectors.toMap(CorrelacionResumenDto::getIncidenteId, Function.identity(), (a, b) -> a));
    }

    public UUID resolverIdDespacho(UUID incidenteId) {
        CorrelacionResumenDto resumen = correlacionClientService.resumen(incidenteId).block();
        if (resumen == null || resumen.getIncidenteCanonicoId() == null) {
            return incidenteId;
        }
        return resumen.getIncidenteCanonicoId();
    }
}
