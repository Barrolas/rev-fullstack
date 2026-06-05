package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.Brigadista;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadistaRepository extends JpaRepository<Brigadista, Long> {

    List<Brigadista> findByEstado(EstadoRecurso estado);

    List<Brigadista> findByIdBrigada(Long idBrigada);
}
