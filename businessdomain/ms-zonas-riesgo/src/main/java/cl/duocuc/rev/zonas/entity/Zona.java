package cl.duocuc.rev.zonas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "zonas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "nivel_riesgo", nullable = false, length = 30)
    private String nivelRiesgo;

    @Column(name = "center_lat", nullable = false)
    private Double centerLat;

    @Column(name = "center_lng", nullable = false)
    private Double centerLng;

    @Column(name = "radio_metros", nullable = false)
    private Double radioMetros;

    @Column(nullable = false, length = 80)
    private String comuna;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(nullable = false)
    private boolean activa;

    @Column(name = "min_lat", nullable = false)
    private Double minLat;

    @Column(name = "max_lat", nullable = false)
    private Double maxLat;

    @Column(name = "min_lng", nullable = false)
    private Double minLng;

    @Column(name = "max_lng", nullable = false)
    private Double maxLng;
}
