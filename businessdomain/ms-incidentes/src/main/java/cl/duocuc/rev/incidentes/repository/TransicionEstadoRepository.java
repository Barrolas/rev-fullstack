package cl.duocuc.rev.incidentes.repository;

import cl.duocuc.rev.incidentes.entity.TransicionEstado;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransicionEstadoRepository extends JpaRepository<TransicionEstado, Long> {

    List<TransicionEstado> findByIncidenteIdOrderByCreatedAtAsc(UUID incidenteId);
}
