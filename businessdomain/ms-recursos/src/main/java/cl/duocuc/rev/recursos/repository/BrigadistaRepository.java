package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.Brigadista;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadistaRepository extends JpaRepository<Brigadista, Long> {

    List<Brigadista> findByEstado(EstadoRecurso estado);

    List<Brigadista> findByIdBrigada(Long idBrigada);

    Optional<Brigadista> findByKeycloakSub(UUID keycloakSub);

    Optional<Brigadista> findByKeycloakUsername(String keycloakUsername);
}
