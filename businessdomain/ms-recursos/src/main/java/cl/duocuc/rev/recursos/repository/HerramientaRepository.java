package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.Herramienta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HerramientaRepository extends JpaRepository<Herramienta, Long> {

    List<Herramienta> findByCantidadDisponibleGreaterThan(Integer cantidad);
}
