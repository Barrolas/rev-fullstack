package cl.duocuc.rev.bff.service;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.KeycloakRegisterClient;
import cl.duocuc.rev.bff.config.PublicReportProperties;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.PublicIncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.PublicReportResponse;
import cl.duocuc.rev.bff.dto.RegisterCiudadanoRequest;
import cl.duocuc.rev.bff.dto.RegisterCiudadanoResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PublicReportFacadeService {

    private final IncidenteClientService incidenteClientService;
    private final KeycloakRegisterClient keycloakRegisterClient;
    private final TurnstileService turnstileService;
    private final NominatimGeocodingService geocodingService;
    private final PublicReportProperties properties;

    public PublicReportResponse reportar(
            PublicIncidenteCreateRequest payload,
            List<MultipartFile> fotos,
            MultipartFile video,
            String honeypot,
            long formLoadedAtEpochMs,
            String captchaToken,
            String clientIp) {

        if (honeypot != null && !honeypot.isBlank()) {
            return PublicReportResponse.builder()
                    .mensaje("Su reporte fue recibido")
                    .build();
        }

        long elapsedMs = Instant.now().toEpochMilli() - formLoadedAtEpochMs;
        if (formLoadedAtEpochMs <= 0 || elapsedMs < properties.getMinFormSeconds() * 1000L) {
            throw new IllegalArgumentException("Espere unos segundos antes de enviar el formulario");
        }

        turnstileService.verify(captchaToken, clientIp);
        resolveCoordinates(payload);

        if (!payload.isAnonimo() && payload.isRegistrarme()) {
            RegisterCiudadanoResponse registro = registrarCiudadano(payload);
            payload.setReportanteUuid(registro.getUserId());
        }

        IncidenteDto incidente = incidenteClientService.crearPublico(payload).block();
        if (incidente == null || incidente.getId() == null) {
            throw new IllegalStateException("No se pudo registrar el incidente");
        }

        uploadAdjuntos(incidente.getId(), fotos, video);

        return PublicReportResponse.builder()
                .id(incidente.getId().toString())
                .folio(incidente.getFolio())
                .mensaje("Su reporte fue recibido. Folio: " + incidente.getFolio())
                .build();
    }

    private void resolveCoordinates(PublicIncidenteCreateRequest payload) {
        if (payload.getLat() != null && payload.getLng() != null) {
            return;
        }
        if (payload.getDireccionReferencia() == null || payload.getDireccionReferencia().isBlank()) {
            throw new IllegalArgumentException("Indique ubicacion en mapa o referencia de direccion");
        }
        NominatimGeocodingService.GeoPoint point = geocodingService.geocode(payload.getDireccionReferencia());
        payload.setLat(point.lat());
        payload.setLng(point.lng());
    }

    private RegisterCiudadanoResponse registrarCiudadano(PublicIncidenteCreateRequest payload) {
        if (payload.getRegistroUsername() == null || payload.getRegistroUsername().isBlank()
                || payload.getRegistroPassword() == null || payload.getRegistroPassword().isBlank()) {
            throw new IllegalArgumentException("Credenciales de registro incompletas");
        }
        RegisterCiudadanoRequest request = new RegisterCiudadanoRequest();
        request.setUsername(payload.getRegistroUsername().trim());
        request.setPassword(payload.getRegistroPassword());
        request.setEmail(payload.getRegistroEmail());
        request.setFirstName(payload.getReportanteNombre());
        request.setLastName(payload.getReportanteApellido());
        request.setRut(payload.getReportanteRut());
        RegisterCiudadanoResponse response = keycloakRegisterClient.registrar(request).block();
        if (response == null || response.getUserId() == null) {
            throw new IllegalStateException("No se pudo registrar el usuario ciudadano");
        }
        return response;
    }

    private void uploadAdjuntos(UUID incidenteId, List<MultipartFile> fotos, MultipartFile video) {
        if (fotos != null) {
            for (MultipartFile foto : fotos) {
                if (foto != null && !foto.isEmpty()) {
                    incidenteClientService.agregarAdjunto(incidenteId, "FOTO", foto).block();
                }
            }
        }
        if (video != null && !video.isEmpty()) {
            incidenteClientService.agregarAdjunto(incidenteId, "VIDEO", video).block();
        }
    }
}
