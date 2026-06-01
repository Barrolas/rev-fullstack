package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.BrigadaBrigadista;
import cl.duocuc.rev.recursos.entity.BrigadaBrigadista.BrigadaBrigadistaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadaBrigadistaRepository extends JpaRepository<BrigadaBrigadista, BrigadaBrigadistaId> {

    List<BrigadaBrigadista> findByBrigadaId(Long brigadaId);

    void deleteByBrigadaId(Long brigadaId);
}
