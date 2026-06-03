package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.cache.ZonaRiesgoCache;
import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.RecursosClientService;
import cl.duocuc.rev.bff.client.ZonaRiesgoClientService;
import cl.duocuc.rev.bff.dto.CorrelacionResumenDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.RecursoDto;
import cl.duocuc.rev.bff.dto.ZonaRiesgoDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardFacadeService {

    private final IncidenteClientService incidenteClientService;
    private final ZonaRiesgoClientService zonaRiesgoClientService;
    private final RecursosClientService recursosClientService;
    private final CorrelacionFacadeService correlacionFacadeService;
    private final ZonaRiesgoCache zonaRiesgoCache;

    private DashboardFacadeService self;

    @Autowired
    void setSelf(@Lazy DashboardFacadeService self) {
        this.self = self;
    }

    public DashboardResponse obtenerPorIncidenteId(UUID id) {
        IncidenteDto incidente = incidenteClientService.obtenerPorId(id).block();
        Map<UUID, CorrelacionResumenDto> resumenes = correlacionFacadeService.cargarResumenes(List.of(id));
        return construirDashboard(incidente, resumenes);
    }

    public List<DashboardResponse> listarDashboards() {
        List<IncidenteDto> incidentes = incidenteClientService.listar().block();
        if (incidentes == null || incidentes.isEmpty()) {
            return Collections.emptyList();
        }
        List<UUID> ids = incidentes.stream().map(IncidenteDto::getId).toList();
        Map<UUID, CorrelacionResumenDto> resumenes = correlacionFacadeService.cargarResumenes(ids);
        return incidentes.stream()
                .map(incidente -> construirDashboard(incidente, resumenes))
                .toList();
    }

    private DashboardResponse construirDashboard(IncidenteDto incidente, Map<UUID, CorrelacionResumenDto> resumenes) {
        correlacionFacadeService.enriquecerIncidente(incidente, resumenes);
        UUID idDespacho = incidente.getIncidenteCanonicoId() != null
                ? incidente.getIncidenteCanonicoId()
                : incidente.getId();
        ZonaRiesgoDto zonaRiesgo = self.obtenerZonaRiesgo(incidente);
        RecursosResult recursosResult = self.obtenerRecursos(idDespacho);

        return DashboardResponse.builder()
                .incidente(incidente)
                .zonaRiesgo(zonaRiesgo)
                .recursos(recursosResult.recursos())
                .degraded(recursosResult.degraded())
                .build();
    }

    public ZonaRiesgoDto obtenerZonaRiesgo(IncidenteDto incidente) {
        if (incidente.getZonaNivelRiesgo() != null && !incidente.getZonaNivelRiesgo().isBlank()) {
            return ZonaRiesgoDto.builder()
                    .nivel(incidente.getZonaNivelRiesgo())
                    .zonaId(incidente.getZonaId())
                    .nombreZona(incidente.getZonaNombre())
                    .lat(incidente.getLat())
                    .lng(incidente.getLng())
                    .cached(true)
                    .build();
        }
        return self.obtenerZonaRiesgoEnVivo(incidente.getLat(), incidente.getLng());
    }

    @CircuitBreaker(name = "zonasRiesgo", fallbackMethod = "zonasRiesgoFallback")
    public ZonaRiesgoDto obtenerZonaRiesgoEnVivo(Double lat, Double lng) {
        if (lat == null || lng == null) {
            return ZonaRiesgoDto.builder()
                    .nivel("DESCONOCIDO")
                    .lat(lat)
                    .lng(lng)
                    .cached(false)
                    .build();
        }
        ZonaRiesgoDto zonaRiesgo = zonaRiesgoClientService.evaluar(lat, lng).block();
        if (zonaRiesgo != null) {
            ZonaRiesgoDto actualizada = ZonaRiesgoDto.builder()
                    .nivel(zonaRiesgo.getNivel())
                    .zonaId(zonaRiesgo.getZonaId())
                    .nombreZona(zonaRiesgo.getNombreZona())
                    .lat(lat)
                    .lng(lng)
                    .cached(false)
                    .build();
            zonaRiesgoCache.put(lat, lng, actualizada);
            return actualizada;
        }
        return ZonaRiesgoDto.builder()
                .nivel("DESCONOCIDO")
                .lat(lat)
                .lng(lng)
                .cached(false)
                .build();
    }

    public ZonaRiesgoDto zonasRiesgoFallback(Double lat, Double lng, Throwable throwable) {
        return zonaRiesgoCache.get(lat, lng)
                .map(cached -> ZonaRiesgoDto.builder()
                        .nivel(cached.getNivel())
                        .lat(lat)
                        .lng(lng)
                        .cached(true)
                        .build())
                .orElseGet(() -> ZonaRiesgoDto.builder()
                        .nivel("DESCONOCIDO")
                        .lat(lat)
                        .lng(lng)
                        .cached(false)
                        .build());
    }

    @CircuitBreaker(name = "recursos", fallbackMethod = "recursosFallback")
    public RecursosResult obtenerRecursos(UUID incidenteId) {
        List<RecursoDto> recursos = recursosClientService.listarPorIncidente(incidenteId).block();
        return new RecursosResult(
                recursos != null ? recursos : Collections.emptyList(),
                false);
    }

    public RecursosResult recursosFallback(UUID incidenteId, Throwable throwable) {
        return new RecursosResult(Collections.emptyList(), true);
    }

    public record RecursosResult(List<RecursoDto> recursos, boolean degraded) {
    }
}
