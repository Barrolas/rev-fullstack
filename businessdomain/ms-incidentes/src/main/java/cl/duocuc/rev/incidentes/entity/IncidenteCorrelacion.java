package cl.duocuc.rev.incidentes.entity;

import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "incidente_correlacion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidenteCorrelacion {

    @Id
    private UUID id;

    @Column(name = "incidente_a_id", nullable = false)
    private UUID incidenteAId;

    @Column(name = "incidente_b_id", nullable = false)
    private UUID incidenteBId;

    @Column(nullable = false)
    private short score;

    @Column(name = "distancia_metros", nullable = false)
    private double distanciaMetros;

    @Column(name = "delta_minutos", nullable = false)
    private int deltaMinutos;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCorrelacion estado;

    @Column(name = "incidente_canonico_id")
    private UUID incidenteCanonicoId;

    @Column(name = "decidido_por", length = 100)
    private String decididoPor;

    @Column(name = "decidido_at")
    private LocalDateTime decididoAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
