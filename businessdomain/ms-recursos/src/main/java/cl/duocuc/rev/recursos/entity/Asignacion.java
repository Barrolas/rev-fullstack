package cl.duocuc.rev.recursos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "asignaciones")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incidente_id", nullable = false)
    private UUID incidenteId;

    @Column(name = "brigada_id", nullable = false)
    private Long brigadaId;

    @Column(name = "vehiculo_id")
    private Long vehiculoId;

    @Column(nullable = false)
    private Boolean activa;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "despachado_por", length = 100)
    private String despachadoPor;

    @Column(name = "estado_despacho", nullable = false, length = 30)
    private String estadoDespacho;

    @Column(name = "f_actualizacion")
    private LocalDateTime fActualizacion;
}
