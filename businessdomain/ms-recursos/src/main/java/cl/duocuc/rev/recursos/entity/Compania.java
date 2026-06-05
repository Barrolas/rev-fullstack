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
@Table(name = "companias")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Compania {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_institucion", nullable = false)
    private Long idInstitucion;

    @Column(name = "id_comuna", nullable = false)
    private Integer idComuna;

    @Column(nullable = false, length = 30)
    private String codigo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String estado;
}
