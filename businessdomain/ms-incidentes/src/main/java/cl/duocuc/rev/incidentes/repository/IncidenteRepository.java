package cl.duocuc.rev.incidentes.repository;

import cl.duocuc.rev.incidentes.entity.Incidente;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidenteRepository extends JpaRepository<Incidente, UUID> {
}
