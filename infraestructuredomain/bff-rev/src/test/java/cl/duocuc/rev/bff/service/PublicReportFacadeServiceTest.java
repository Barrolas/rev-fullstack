package cl.duocuc.rev.bff.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.client.KeycloakRegisterClient;
import cl.duocuc.rev.bff.config.PublicReportProperties;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.PublicIncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.PublicReportResponse;
import cl.duocuc.rev.bff.dto.RegisterCiudadanoResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class PublicReportFacadeServiceTest {

    @Mock
    private IncidenteClientService incidenteClientService;

    @Mock
    private KeycloakRegisterClient keycloakRegisterClient;

    @Mock
    private TurnstileService turnstileService;

    @Mock
    private NominatimGeocodingService geocodingService;

    @Mock
    private PublicReportProperties properties;

    @InjectMocks
    private PublicReportFacadeService publicReportFacadeService;

    @Test
    void reportar_honeypot_retornaMensajeGenerico() {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setTipo("FORESTAL");

        PublicReportResponse response = publicReportFacadeService.reportar(
                payload, List.of(), null, "bot-field", Instant.now().toEpochMilli(), "token", "127.0.0.1");

        assertEquals("Su reporte fue recibido", response.getMensaje());
        verify(turnstileService, never()).verify(any(), any());
        verify(incidenteClientService, never()).crearPublico(any());
    }

    @Test
    void reportar_formularioMuyRapido_lanzaExcepcion() {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setLat(-33.4);
        payload.setLng(-70.5);
        long loadedAt = Instant.now().toEpochMilli();
        when(properties.getMinFormSeconds()).thenReturn(3L);

        assertThrows(IllegalArgumentException.class, () -> publicReportFacadeService.reportar(
                payload, List.of(), null, "", loadedAt, "token", "127.0.0.1"));
    }

    @Test
    void reportar_conCoordenadas_creaIncidente() {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setTipo("FORESTAL");
        payload.setDescripcion("Humo visible");
        payload.setLat(-33.4);
        payload.setLng(-70.5);
        UUID id = UUID.randomUUID();
        IncidenteDto incidente = IncidenteDto.builder().id(id).folio("REV-PUB-1").build();
        long loadedAt = Instant.now().minusSeconds(10).toEpochMilli();

        when(properties.getMinFormSeconds()).thenReturn(3L);
        doNothing().when(turnstileService).verify("token", "127.0.0.1");
        when(incidenteClientService.crearPublico(payload)).thenReturn(Mono.just(incidente));

        PublicReportResponse response = publicReportFacadeService.reportar(
                payload, List.of(), null, "", loadedAt, "token", "127.0.0.1");

        assertEquals(id.toString(), response.getId());
        assertEquals("REV-PUB-1", response.getFolio());
        verify(turnstileService).verify("token", "127.0.0.1");
    }

    @Test
    void reportar_sinCoordenadas_geocodificaDireccion() {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setTipo("FORESTAL");
        payload.setDescripcion("Incendio");
        payload.setDireccionReferencia("Av. Principal 100, Valle");
        UUID id = UUID.randomUUID();
        IncidenteDto incidente = IncidenteDto.builder().id(id).folio("REV-PUB-2").build();
        long loadedAt = Instant.now().minusSeconds(10).toEpochMilli();

        when(properties.getMinFormSeconds()).thenReturn(3L);
        doNothing().when(turnstileService).verify(any(), any());
        when(geocodingService.geocode("Av. Principal 100, Valle"))
                .thenReturn(new NominatimGeocodingService.GeoPoint(-33.4, -70.5));
        when(incidenteClientService.crearPublico(payload)).thenReturn(Mono.just(incidente));

        PublicReportResponse response = publicReportFacadeService.reportar(
                payload, List.of(), null, "", loadedAt, "token", "127.0.0.1");

        assertEquals(-33.4, payload.getLat());
        assertEquals(-70.5, payload.getLng());
        assertEquals("REV-PUB-2", response.getFolio());
    }

    @Test
    void reportar_registroCiudadano_asignaReportanteUuid() {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setTipo("FORESTAL");
        payload.setLat(-33.4);
        payload.setLng(-70.5);
        payload.setAnonimo(false);
        payload.setRegistrarme(true);
        payload.setRegistroUsername("ciudadano1");
        payload.setRegistroPassword("secret123");
        payload.setReportanteNombre("Juan");
        payload.setReportanteApellido("Perez");
        UUID userId = UUID.randomUUID();
        RegisterCiudadanoResponse registro = RegisterCiudadanoResponse.builder().userId(userId).build();
        IncidenteDto incidente = IncidenteDto.builder().id(UUID.randomUUID()).folio("REV-PUB-3").build();
        long loadedAt = Instant.now().minusSeconds(10).toEpochMilli();

        when(properties.getMinFormSeconds()).thenReturn(3L);
        doNothing().when(turnstileService).verify(any(), any());
        when(keycloakRegisterClient.registrar(any())).thenReturn(Mono.just(registro));
        when(incidenteClientService.crearPublico(payload)).thenReturn(Mono.just(incidente));

        publicReportFacadeService.reportar(payload, List.of(), null, "", loadedAt, "token", "127.0.0.1");

        assertEquals(userId, payload.getReportanteUuid());
        verify(keycloakRegisterClient).registrar(any());
    }
}
