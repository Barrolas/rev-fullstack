package cl.duocuc.rev.zonas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "condiciones_climaticas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CondicionClimatica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zona_id", nullable = false)
    private Long zonaId;

    @Column(name = "temperatura_c", nullable = false)
    private Double temperaturaC;

    @Column(name = "humedad_pct", nullable = false)
    private Integer humedadPct;

    @Column(name = "viento_kmh", nullable = false)
    private Double vientoKmh;

    @Column(nullable = false, length = 100)
    private String descripcion;

    @Column(name = "registrado_at", nullable = false)
    private LocalDateTime registradoAt;
}
