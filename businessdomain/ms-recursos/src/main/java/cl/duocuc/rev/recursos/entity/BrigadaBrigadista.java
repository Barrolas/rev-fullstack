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
@Table(name = "brigada_brigadistas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadaBrigadista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "brigada_id", nullable = false)
    private Long brigadaId;

    @Column(name = "brigadista_id", nullable = false)
    private Long brigadistaId;

    @Column(name = "id_rol_brigadista")
    private Long idRolBrigadista;

    @Column(name = "es_jefe", nullable = false)
    private Boolean esJefe;

    @Column(nullable = false)
    private Boolean activa;

    @Column(name = "f_desde", nullable = false)
    private LocalDateTime fDesde;

    @Column(name = "f_hasta")
    private LocalDateTime fHasta;
}
