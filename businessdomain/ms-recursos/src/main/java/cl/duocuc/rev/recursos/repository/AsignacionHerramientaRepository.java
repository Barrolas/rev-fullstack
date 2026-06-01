package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.AsignacionHerramienta;
import cl.duocuc.rev.recursos.entity.AsignacionHerramienta.AsignacionHerramientaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsignacionHerramientaRepository extends JpaRepository<AsignacionHerramienta, AsignacionHerramientaId> {

    List<AsignacionHerramienta> findByAsignacionId(Long asignacionId);

    void deleteByAsignacionId(Long asignacionId);
}
