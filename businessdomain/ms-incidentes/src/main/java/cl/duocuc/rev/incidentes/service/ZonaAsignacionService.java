package cl.duocuc.rev.incidentes.service;

import cl.duocuc.rev.incidentes.client.ZonaResolverClient;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ZonaAsignacionService {

    private final ZonaResolverClient zonaResolverClient;
    private final IncidenteRepository incidenteRepository;

    public void asignarZonaSiAplica(Incidente incidente) {
        if (incidente.getLat() == null || incidente.getLng() == null) {
            incidente.setZonaId(null);
            incidente.setZonaNombre(null);
            incidente.setZonaNivelRiesgo(null);
            return;
        }
        zonaResolverClient.resolver(incidente.getLat(), incidente.getLng()).ifPresentOrElse(
                z -> {
                    incidente.setZonaId(z.getZonaId());
                    incidente.setZonaNombre(z.getNombre());
                    incidente.setZonaNivelRiesgo(z.getNivelRiesgo());
                },
                () -> {
                    incidente.setZonaId(null);
                    incidente.setZonaNombre(null);
                    incidente.setZonaNivelRiesgo(null);
                });
    }

    @Transactional
    public int recalcularTodas() {
        List<Incidente> conGps = incidenteRepository.findAll().stream()
                .filter(i -> i.getLat() != null && i.getLng() != null)
                .toList();
        for (Incidente incidente : conGps) {
            asignarZonaSiAplica(incidente);
        }
        incidenteRepository.saveAll(conGps);
        return conGps.size();
    }
}
