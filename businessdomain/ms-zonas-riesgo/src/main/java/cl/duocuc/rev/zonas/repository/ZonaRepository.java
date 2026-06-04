package cl.duocuc.rev.zonas.repository;

import cl.duocuc.rev.zonas.entity.Zona;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZonaRepository extends JpaRepository<Zona, Long> {

    List<Zona> findByActivaTrueOrderByNombreAsc();

    List<Zona> findAllByOrderByNombreAsc();
}
