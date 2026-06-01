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
@Table(name = "asignacion_brigadistas")
@IdClass(AsignacionBrigadista.AsignacionBrigadistaId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionBrigadista {

    @Id
    @Column(name = "asignacion_id")
    private Long asignacionId;

    @Id
    @Column(name = "brigadista_id")
    private Long brigadistaId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AsignacionBrigadistaId implements Serializable {
        private Long asignacionId;
        private Long brigadistaId;
    }
}
