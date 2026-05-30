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
@Table(name = "brigadas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Brigada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private Integer capacidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoRecurso estado;
}
