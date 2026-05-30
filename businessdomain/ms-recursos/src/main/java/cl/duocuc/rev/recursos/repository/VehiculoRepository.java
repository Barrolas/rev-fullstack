package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.Vehiculo;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    List<Vehiculo> findByEstado(EstadoRecurso estado);
}
