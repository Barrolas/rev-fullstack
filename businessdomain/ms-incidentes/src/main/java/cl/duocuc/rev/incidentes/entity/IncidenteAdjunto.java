package cl.duocuc.rev.incidentes.entity;

import cl.duocuc.rev.incidentes.model.TipoAdjunto;
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
@Table(name = "incidente_adjuntos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidenteAdjunto {

    @Id
    private UUID id;

    @Column(name = "incidente_id", nullable = false)
    private UUID incidenteId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoAdjunto tipo;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "contenido_hash", nullable = false, length = 64)
    private String contenidoHash;

    @Column(name = "ruta_storage", nullable = false, length = 500)
    private String rutaStorage;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "tamano_bytes", nullable = false)
    private long tamanoBytes;

    @Column(nullable = false)
    private int orden;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
