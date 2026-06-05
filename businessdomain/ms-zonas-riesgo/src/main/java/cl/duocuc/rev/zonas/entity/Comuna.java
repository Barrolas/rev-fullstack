package cl.duocuc.rev.zonas.entity;

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
@Table(name = "comunas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comuna {

    @Id
    @Column(name = "codigo_casen")
    private Integer codigoCasen;

    @Column(name = "codigo_provincia_casen", nullable = false)
    private Integer codigoProvinciaCasen;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String estado;
}
