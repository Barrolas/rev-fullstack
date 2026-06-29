package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.config.StorageProperties;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class AdjuntoStorageServiceTest {

    @Mock
    private StorageProperties storageProperties;

    @InjectMocks
    private AdjuntoStorageService adjuntoStorageService;

    @TempDir
    Path tempDir;

    @Test
    void store_persisteArchivoYCalculaHash() throws IOException {
        UUID incidenteId = UUID.randomUUID();
        when(storageProperties.getPath()).thenReturn(tempDir.toString());

        MultipartFile file = mock(MultipartFile.class);
        byte[] content = "contenido-prueba".getBytes();
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(content));
        when(file.getOriginalFilename()).thenReturn("foto.jpg");

        AdjuntoStorageService.StoredFile stored = adjuntoStorageService.store(incidenteId, file);

        assertTrue(Files.exists(Path.of(stored.rutaStorage())));
        assertEquals(content.length, stored.tamanoBytes());
        assertEquals(64, stored.contenidoHash().length());
    }

    @Test
    void resolvePath_devuelvePath() {
        Path path = adjuntoStorageService.resolvePath(tempDir.resolve("x.jpg").toString());

        assertEquals(tempDir.resolve("x.jpg"), path);
    }
}
