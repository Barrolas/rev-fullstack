package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.BrigadaHerramienta;
import cl.duocuc.rev.recursos.entity.BrigadaHerramienta.BrigadaHerramientaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadaHerramientaRepository extends JpaRepository<BrigadaHerramienta, BrigadaHerramientaId> {

    List<BrigadaHerramienta> findByBrigadaId(Long brigadaId);

    void deleteByBrigadaId(Long brigadaId);
}
