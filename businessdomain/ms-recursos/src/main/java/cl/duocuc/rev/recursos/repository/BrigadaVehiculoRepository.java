package cl.duocuc.rev.recursos.repository;

import cl.duocuc.rev.recursos.entity.BrigadaVehiculo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrigadaVehiculoRepository extends JpaRepository<BrigadaVehiculo, Long> {

    List<BrigadaVehiculo> findByIdBrigadaAndActivaTrue(Long idBrigada);

    List<BrigadaVehiculo> findByIdBrigada(Long idBrigada);

    Optional<BrigadaVehiculo> findByIdBrigadaAndIdVehiculoAndActivaTrue(Long idBrigada, Long idVehiculo);

    boolean existsByIdVehiculoAndActivaTrueAndIdBrigadaNot(Long idVehiculo, Long idBrigada);

    void deleteByIdBrigada(Long idBrigada);
}
