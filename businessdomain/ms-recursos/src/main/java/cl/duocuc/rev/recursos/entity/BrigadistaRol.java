package cl.duocuc.rev.recursos.entity;

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
@Table(name = "brigadista_roles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadistaRol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false)
    private Integer jerarquia;

    @Column(nullable = false, length = 20)
    private String estado;
}
