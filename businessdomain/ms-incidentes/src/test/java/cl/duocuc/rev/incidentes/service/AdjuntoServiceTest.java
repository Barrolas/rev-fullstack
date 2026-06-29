package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.config.StorageProperties;
import cl.duocuc.rev.incidentes.entity.IncidenteAdjunto;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.TipoAdjunto;
import cl.duocuc.rev.incidentes.repository.IncidenteAdjuntoRepository;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class AdjuntoServiceTest {

    @Mock
    private IncidenteRepository incidenteRepository;

    @Mock
    private IncidenteAdjuntoRepository adjuntoRepository;

    @Mock
    private AdjuntoStorageService storageService;

    @Mock
    private StorageProperties storageProperties;

    @InjectMocks
    private AdjuntoService adjuntoService;

    private UUID incidenteId;

    @BeforeEach
    void setUp() {
        incidenteId = UUID.randomUUID();
    }

    @Test
    void listar_incidenteExiste_retornaAdjuntos() {
        IncidenteAdjunto adjunto = IncidenteAdjunto.builder()
                .id(UUID.randomUUID())
                .incidenteId(incidenteId)
                .tipo(TipoAdjunto.FOTO)
                .nombreArchivo("foto.jpg")
                .mimeType("image/jpeg")
                .tamanoBytes(1024L)
                .orden(1)
                .createdAt(LocalDateTime.now())
                .build();
        when(incidenteRepository.existsById(incidenteId)).thenReturn(true);
        when(adjuntoRepository.findByIncidenteIdOrderByOrdenAsc(incidenteId)).thenReturn(List.of(adjunto));

        var list = adjuntoService.listar(incidenteId);

        assertEquals(1, list.size());
        assertEquals("foto.jpg", list.get(0).getNombreArchivo());
    }

    @Test
    void listar_incidenteNoExiste_lanzaNotFound() {
        when(incidenteRepository.existsById(incidenteId)).thenReturn(false);

        assertThrows(BusinessRuleException.class, () -> adjuntoService.listar(incidenteId));
    }

    @Test
    void agregar_fotoValida_persiste() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/jpeg");
        when(file.getSize()).thenReturn(2048L);
        when(file.getOriginalFilename()).thenReturn("evidencia.jpg");

        when(incidenteRepository.existsById(incidenteId)).thenReturn(true);
        when(storageProperties.getMaxPhotoBytes()).thenReturn(5_000_000L);
        when(adjuntoRepository.countByIncidenteIdAndTipo(incidenteId, TipoAdjunto.FOTO)).thenReturn(0L);
        when(storageService.store(incidenteId, file))
                .thenReturn(new AdjuntoStorageService.StoredFile("/tmp/x.jpg", "abc123", 2048L));
        when(adjuntoRepository.existsByIncidenteIdAndContenidoHash(incidenteId, "abc123")).thenReturn(false);
        when(adjuntoRepository.countByIncidenteId(incidenteId)).thenReturn(0L);
        when(adjuntoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = adjuntoService.agregar(incidenteId, TipoAdjunto.FOTO, file);

        assertEquals(TipoAdjunto.FOTO, response.getTipo());
        assertEquals("image/jpeg", response.getMimeType());
        verify(adjuntoRepository).save(any());
    }

    @Test
    void agregar_archivoVacio_lanzaValidacion() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        when(incidenteRepository.existsById(incidenteId)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> adjuntoService.agregar(incidenteId, TipoAdjunto.FOTO, file));
    }

    @Test
    void agregar_fotoMimeInvalido_lanzaValidacion() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(incidenteRepository.existsById(incidenteId)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> adjuntoService.agregar(incidenteId, TipoAdjunto.FOTO, file));
    }

    @Test
    void agregar_duplicado_lanzaExcepcion() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");
        when(file.getSize()).thenReturn(100L);
        when(incidenteRepository.existsById(incidenteId)).thenReturn(true);
        when(storageProperties.getMaxPhotoBytes()).thenReturn(5_000_000L);
        when(adjuntoRepository.countByIncidenteIdAndTipo(incidenteId, TipoAdjunto.FOTO)).thenReturn(0L);
        when(storageService.store(incidenteId, file))
                .thenReturn(new AdjuntoStorageService.StoredFile("/tmp/x.png", "dup", 100L));
        when(adjuntoRepository.existsByIncidenteIdAndContenidoHash(incidenteId, "dup")).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> adjuntoService.agregar(incidenteId, TipoAdjunto.FOTO, file));
    }

    @Test
    void obtener_existe_retornaEntidad() {
        UUID adjuntoId = UUID.randomUUID();
        IncidenteAdjunto adjunto = IncidenteAdjunto.builder().id(adjuntoId).incidenteId(incidenteId).build();
        when(adjuntoRepository.findByIdAndIncidenteId(adjuntoId, incidenteId)).thenReturn(Optional.of(adjunto));

        IncidenteAdjunto result = adjuntoService.obtener(incidenteId, adjuntoId);

        assertEquals(adjuntoId, result.getId());
    }

    @Test
    void obtener_noExiste_lanzaNotFound() {
        UUID adjuntoId = UUID.randomUUID();
        when(adjuntoRepository.findByIdAndIncidenteId(adjuntoId, incidenteId)).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () -> adjuntoService.obtener(incidenteId, adjuntoId));
    }
}
