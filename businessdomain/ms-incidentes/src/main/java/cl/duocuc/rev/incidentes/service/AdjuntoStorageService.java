package cl.duocuc.rev.incidentes.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AdjuntoStorageService {

    private final cl.duocuc.rev.incidentes.config.StorageProperties storageProperties;

    public StoredFile store(UUID incidenteId, MultipartFile file) throws IOException {
        Path incidentDir = Path.of(storageProperties.getPath(), incidenteId.toString());
        Files.createDirectories(incidentDir);

        String extension = extensionFrom(file);
        Path target = incidentDir.resolve(UUID.randomUUID() + extension);

        MessageDigest digest = sha256Digest();
        long bytesWritten;
        try (InputStream in = file.getInputStream();
                DigestInputStream din = new DigestInputStream(in, digest);
                OutputStream out = Files.newOutputStream(target)) {
            bytesWritten = din.transferTo(out);
        }

        String hash = HexFormat.of().formatHex(digest.digest());
        return new StoredFile(target.toString(), hash, bytesWritten);
    }

    public Path resolvePath(String rutaStorage) {
        return Path.of(rutaStorage);
    }

    private static MessageDigest sha256Digest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (Exception ex) {
            throw new IllegalStateException("SHA-256 no disponible", ex);
        }
    }

    private static String extensionFrom(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            return original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        return ".bin";
    }

    public record StoredFile(String rutaStorage, String contenidoHash, long tamanoBytes) {
    }
}
