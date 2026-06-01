package cl.duocuc.rev.incidentes.repository;

import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IncidenteRepository extends JpaRepository<Incidente, UUID> {

    Optional<Incidente> findByFolio(String folio);

    List<Incidente> findByIncidenteCanonicoId(UUID incidenteCanonicoId);

    long countByIncidenteCanonicoId(UUID incidenteCanonicoId);

    @Query("""
            SELECT i FROM Incidente i
            WHERE i.id <> :excludeId
              AND i.lat IS NOT NULL AND i.lng IS NOT NULL
              AND i.estado IN :estados
              AND i.createdAt >= :desde
              AND i.lat BETWEEN :minLat AND :maxLat
              AND i.lng BETWEEN :minLng AND :maxLng
            """)
    List<Incidente> findCandidatosCorrelacion(
            @Param("excludeId") UUID excludeId,
            @Param("estados") List<EstadoIncidente> estados,
            @Param("desde") LocalDateTime desde,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng);
}
