package cl.duocuc.rev.recursos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "brigada_herramientas")
@IdClass(BrigadaHerramienta.BrigadaHerramientaId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrigadaHerramienta {

    @Id
    @Column(name = "brigada_id")
    private Long brigadaId;

    @Id
    @Column(name = "herramienta_id")
    private Long herramientaId;

    @Column(nullable = false)
    private Integer cantidad;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrigadaHerramientaId implements Serializable {
        private Long brigadaId;
        private Long herramientaId;
    }
}
