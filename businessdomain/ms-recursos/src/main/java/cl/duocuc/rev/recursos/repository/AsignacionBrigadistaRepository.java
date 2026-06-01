package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.AsignacionBrigadista;
import cl.duocuc.rev.recursos.entity.AsignacionBrigadista.AsignacionBrigadistaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsignacionBrigadistaRepository extends JpaRepository<AsignacionBrigadista, AsignacionBrigadistaId> {

    List<AsignacionBrigadista> findByAsignacionId(Long asignacionId);

    void deleteByAsignacionId(Long asignacionId);
}
