package cl.duocuc.rev.incidentes.service;

import cl.duocuc.rev.incidentes.config.StorageProperties;
import cl.duocuc.rev.incidentes.dto.AdjuntoResponse;
import cl.duocuc.rev.incidentes.entity.IncidenteAdjunto;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.TipoAdjunto;
import cl.duocuc.rev.incidentes.repository.IncidenteAdjuntoRepository;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AdjuntoService {

    private static final Set<String> FOTO_MIMES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> VIDEO_MIMES = Set.of("video/mp4", "video/webm");

    private final IncidenteRepository incidenteRepository;
    private final IncidenteAdjuntoRepository adjuntoRepository;
    private final AdjuntoStorageService storageService;
    private final StorageProperties storageProperties;

    public List<AdjuntoResponse> listar(UUID incidenteId) {
        ensureIncidenteExists(incidenteId);
        return adjuntoRepository.findByIncidenteIdOrderByOrdenAsc(incidenteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdjuntoResponse agregar(UUID incidenteId, TipoAdjunto tipo, MultipartFile file) throws IOException {
        ensureIncidenteExists(incidenteId);
        validateLimits(incidenteId, tipo, file);

        AdjuntoStorageService.StoredFile stored = storageService.store(incidenteId, file);
        if (adjuntoRepository.existsByIncidenteIdAndContenidoHash(incidenteId, stored.contenidoHash())) {
            throw new BusinessRuleException(
                    "DUPLICATE_FILE",
                    "Esta imagen o video ya fue adjuntada a este reporte",
                    HttpStatus.BAD_REQUEST);
        }

        int orden = (int) adjuntoRepository.countByIncidenteId(incidenteId) + 1;
        IncidenteAdjunto adjunto = IncidenteAdjunto.builder()
                .id(UUID.randomUUID())
                .incidenteId(incidenteId)
                .tipo(tipo)
                .nombreArchivo(safeFilename(file))
                .contenidoHash(stored.contenidoHash())
                .rutaStorage(stored.rutaStorage())
                .mimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .tamanoBytes(stored.tamanoBytes())
                .orden(orden)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(adjuntoRepository.save(adjunto));
    }

    public IncidenteAdjunto obtener(UUID incidenteId, UUID adjuntoId) {
        return adjuntoRepository.findByIdAndIncidenteId(adjuntoId, incidenteId)
                .orElseThrow(() -> new BusinessRuleException(
                        "NOT_FOUND", "Adjunto no encontrado", HttpStatus.NOT_FOUND));
    }

    private void validateLimits(UUID incidenteId, TipoAdjunto tipo, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("EMPTY_FILE", "Archivo vacio", HttpStatus.BAD_REQUEST);
        }
        String mime = file.getContentType() != null ? file.getContentType() : "";
        if (tipo == TipoAdjunto.FOTO) {
            if (!FOTO_MIMES.contains(mime)) {
                throw new BusinessRuleException("INVALID_MIME", "Formato de foto no permitido", HttpStatus.BAD_REQUEST);
            }
            if (file.getSize() > storageProperties.getMaxPhotoBytes()) {
                throw new BusinessRuleException("FILE_TOO_LARGE", "Foto excede tamano maximo", HttpStatus.BAD_REQUEST);
            }
            if (adjuntoRepository.countByIncidenteIdAndTipo(incidenteId, TipoAdjunto.FOTO) >= 3) {
                throw new BusinessRuleException("MAX_PHOTOS", "Maximo 3 fotos por reporte", HttpStatus.BAD_REQUEST);
            }
        } else {
            if (!VIDEO_MIMES.contains(mime)) {
                throw new BusinessRuleException("INVALID_MIME", "Formato de video no permitido", HttpStatus.BAD_REQUEST);
            }
            if (file.getSize() > storageProperties.getMaxVideoBytes()) {
                throw new BusinessRuleException("FILE_TOO_LARGE", "Video excede tamano maximo", HttpStatus.BAD_REQUEST);
            }
            if (adjuntoRepository.countByIncidenteIdAndTipo(incidenteId, TipoAdjunto.VIDEO) >= 1) {
                throw new BusinessRuleException("MAX_VIDEOS", "Maximo 1 video por reporte", HttpStatus.BAD_REQUEST);
            }
        }
    }

    private void ensureIncidenteExists(UUID incidenteId) {
        if (!incidenteRepository.existsById(incidenteId)) {
            throw new BusinessRuleException("NOT_FOUND", "Incidente no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    private static String safeFilename(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            return "archivo";
        }
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private AdjuntoResponse toResponse(IncidenteAdjunto adjunto) {
        return AdjuntoResponse.builder()
                .id(adjunto.getId())
                .incidenteId(adjunto.getIncidenteId())
                .tipo(adjunto.getTipo())
                .nombreArchivo(adjunto.getNombreArchivo())
                .mimeType(adjunto.getMimeType())
                .tamanoBytes(adjunto.getTamanoBytes())
                .orden(adjunto.getOrden())
                .createdAt(adjunto.getCreatedAt())
                .build();
    }
}
