package cl.duocuc.rev.incidentes.repository;

import cl.duocuc.rev.incidentes.entity.IncidenteCorrelacion;
import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IncidenteCorrelacionRepository extends JpaRepository<IncidenteCorrelacion, UUID> {

    Optional<IncidenteCorrelacion> findByIncidenteAIdAndIncidenteBId(UUID incidenteAId, UUID incidenteBId);

    List<IncidenteCorrelacion> findByEstadoOrderByScoreDescCreatedAtDesc(EstadoCorrelacion estado);

    @Query("""
            SELECT c FROM IncidenteCorrelacion c
            WHERE c.estado = :estado
              AND (c.incidenteAId = :incidenteId OR c.incidenteBId = :incidenteId)
            ORDER BY c.score DESC, c.createdAt DESC
            """)
    List<IncidenteCorrelacion> findByIncidenteAndEstado(
            @Param("incidenteId") UUID incidenteId, @Param("estado") EstadoCorrelacion estado);

    @Query("""
            SELECT c FROM IncidenteCorrelacion c
            WHERE c.incidenteAId = :incidenteId OR c.incidenteBId = :incidenteId
            ORDER BY c.createdAt DESC
            """)
    List<IncidenteCorrelacion> findAllByIncidenteId(@Param("incidenteId") UUID incidenteId);

    @Query("""
            SELECT COUNT(c) FROM IncidenteCorrelacion c
            WHERE c.estado = 'PENDIENTE'
              AND (c.incidenteAId = :incidenteId OR c.incidenteBId = :incidenteId)
            """)
    long countPendientesByIncidenteId(@Param("incidenteId") UUID incidenteId);

    @Query("""
            SELECT COALESCE(MAX(c.score), 0) FROM IncidenteCorrelacion c
            WHERE c.estado = 'PENDIENTE'
              AND (c.incidenteAId = :incidenteId OR c.incidenteBId = :incidenteId)
            """)
    short maxScorePendienteByIncidenteId(@Param("incidenteId") UUID incidenteId);
}
