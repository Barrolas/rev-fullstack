package cl.duocuc.rev.incidentes.entity;

import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "incidentes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incidente {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String folio;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoIncidente estado;

    private Double lat;
    private Double lng;

    @Column(name = "direccion_referencia", length = 500)
    private String direccionReferencia;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(nullable = false)
    private boolean anonimo;

    @Column(name = "reportante_nombre", length = 100)
    private String reportanteNombre;

    @Column(name = "reportante_apellido", length = 100)
    private String reportanteApellido;

    @Column(name = "reportante_rut", length = 20)
    private String reportanteRut;

    @Column(name = "reportante_contacto", length = 100)
    private String reportanteContacto;

    @Enumerated(EnumType.STRING)
    @Column(name = "origen_reporte", nullable = false, length = 20)
    private OrigenReporte origenReporte;

    @Column(name = "reportante_uuid", nullable = false)
    private UUID reportanteUuid;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
