package cl.duocuc.rev.recursos.entity;

import cl.duocuc.rev.recursos.model.EstadoRecurso;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "brigadistas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Brigadista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(length = 12)
    private String rut;

    @Column(length = 80)
    private String especialidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoRecurso estado;

    @Column(name = "id_brigada")
    private Long idBrigada;

    @Column(name = "id_rol_brigadista")
    private Long idRolBrigadista;
}
