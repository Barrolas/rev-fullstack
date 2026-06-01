package cl.duocuc.rev.incidentes.repository;

import cl.duocuc.rev.incidentes.entity.IncidenteAdjunto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidenteAdjuntoRepository extends JpaRepository<IncidenteAdjunto, UUID> {

    List<IncidenteAdjunto> findByIncidenteIdOrderByOrdenAsc(UUID incidenteId);

    boolean existsByIncidenteIdAndContenidoHash(UUID incidenteId, String contenidoHash);

    Optional<IncidenteAdjunto> findByIdAndIncidenteId(UUID id, UUID incidenteId);

    long countByIncidenteIdAndTipo(UUID incidenteId, cl.duocuc.rev.incidentes.model.TipoAdjunto tipo);

    long countByIncidenteId(UUID incidenteId);
}
