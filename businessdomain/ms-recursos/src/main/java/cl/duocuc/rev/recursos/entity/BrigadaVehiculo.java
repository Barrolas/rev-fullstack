package cl.duocuc.rev.recursos.entity;

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
@Table(name = "brigada_vehiculos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadaVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_brigada", nullable = false)
    private Long idBrigada;

    @Column(name = "id_vehiculo", nullable = false)
    private Long idVehiculo;

    @Column(nullable = false)
    private Boolean principal;

    @Column(nullable = false)
    private Boolean activa;

    @Column(name = "f_desde", nullable = false)
    private LocalDateTime fDesde;

    @Column(name = "f_hasta")
    private LocalDateTime fHasta;
}
