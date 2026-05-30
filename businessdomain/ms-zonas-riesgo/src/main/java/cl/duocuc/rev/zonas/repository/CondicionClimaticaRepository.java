package cl.duocuc.rev.zonas.repository;

import cl.duocuc.rev.zonas.entity.CondicionClimatica;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CondicionClimaticaRepository extends JpaRepository<CondicionClimatica, Long> {

    Optional<CondicionClimatica> findFirstByZonaIdOrderByRegistradoAtDesc(Long zonaId);
}
