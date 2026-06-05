package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.BrigadistaRol;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadistaRolRepository extends JpaRepository<BrigadistaRol, Long> {

    Optional<BrigadistaRol> findByCodigo(String codigo);
}
