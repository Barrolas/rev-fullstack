package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.Asignacion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsignacionRepository extends JpaRepository<Asignacion, Long> {

    Optional<Asignacion> findByIdAndActivaTrue(Long id);

    Optional<Asignacion> findByIncidenteIdAndActivaTrue(UUID incidenteId);

    boolean existsByIncidenteIdAndActivaTrue(UUID incidenteId);

    boolean existsByIncidenteIdAndBrigadaIdAndActivaTrue(UUID incidenteId, Long brigadaId);

    List<Asignacion> findAllByIncidenteIdAndActivaTrue(UUID incidenteId);

    List<Asignacion> findByActivaTrueOrderByCreatedAtDesc();

    List<Asignacion> findByBrigadaIdAndActivaTrueOrderByCreatedAtDesc(Long brigadaId);
}
