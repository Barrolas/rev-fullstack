package cl.duocuc.rev.zonas.repository;

import cl.duocuc.rev.zonas.entity.Zona;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ZonaRepository extends JpaRepository<Zona, Long> {

    @Query("""
            SELECT z FROM Zona z
            WHERE :lat BETWEEN z.minLat AND z.maxLat
              AND :lng BETWEEN z.minLng AND z.maxLng
            """)
    Optional<Zona> findByCoordenadas(@Param("lat") double lat, @Param("lng") double lng);
}
