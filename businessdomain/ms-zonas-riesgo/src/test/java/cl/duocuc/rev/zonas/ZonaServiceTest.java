package cl.duocuc.rev.zonas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.dto.ZonaResponse;
import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.exception.BusinessRuleException;
import cl.duocuc.rev.zonas.port.WeatherDataPort;
import cl.duocuc.rev.zonas.repository.ZonaRepository;
import cl.duocuc.rev.zonas.service.ZonaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ZonaServiceTest {

    @Mock
    private ZonaRepository zonaRepository;

    @Mock
    private WeatherDataPort weatherDataPort;

    @InjectMocks
    private ZonaService zonaService;

    @Test
    void crear_zonaValida_persiste() {
        ZonaRequest request = new ZonaRequest();
        request.setNombre("Sector Norte");
        request.setNivelRiesgo("HIGH");
        request.setMinLat(-34.0);
        request.setMaxLat(-33.0);
        request.setMinLng(-71.0);
        request.setMaxLng(-70.0);

        Zona saved = Zona.builder()
                .id(1L)
                .nombre("Sector Norte")
                .nivelRiesgo("HIGH")
                .minLat(-34.0)
                .maxLat(-33.0)
                .minLng(-71.0)
                .maxLng(-70.0)
                .build();
        when(zonaRepository.save(any())).thenReturn(saved);

        ZonaResponse response = zonaService.crear(request);

        assertEquals("HIGH", response.getNivelRiesgo());
        verify(zonaRepository).save(any());
    }

    @Test
    void crear_nivelInvalido_lanzaExcepcion() {
        ZonaRequest request = new ZonaRequest();
        request.setNombre("Test");
        request.setNivelRiesgo("CRITICO");
        request.setMinLat(-34.0);
        request.setMaxLat(-33.0);
        request.setMinLng(-71.0);
        request.setMaxLng(-70.0);

        assertThrows(BusinessRuleException.class, () -> zonaService.crear(request));
    }
}
