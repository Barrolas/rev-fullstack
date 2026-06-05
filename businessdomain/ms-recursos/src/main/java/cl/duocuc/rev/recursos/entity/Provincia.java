package cl.duocuc.rev.recursos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "provincias")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Provincia {

    @Id
    @Column(name = "codigo_casen")
    private Integer codigoCasen;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String estado;
}
