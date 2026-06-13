package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.BrigadaBrigadista;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadaBrigadistaRepository extends JpaRepository<BrigadaBrigadista, Long> {

    List<BrigadaBrigadista> findByBrigadaIdAndActivaTrue(Long brigadaId);

    Optional<BrigadaBrigadista> findByBrigadistaIdAndActivaTrue(Long brigadistaId);

    Optional<BrigadaBrigadista> findByBrigadaIdAndBrigadistaIdAndActivaTrue(Long brigadaId, Long brigadistaId);

    List<BrigadaBrigadista> findByBrigadaId(Long brigadaId);
}
