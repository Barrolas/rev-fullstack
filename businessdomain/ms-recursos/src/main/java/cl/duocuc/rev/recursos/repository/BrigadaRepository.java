package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadaRepository extends JpaRepository<Brigada, Long> {

    List<Brigada> findByEstado(EstadoRecurso estado);
}
