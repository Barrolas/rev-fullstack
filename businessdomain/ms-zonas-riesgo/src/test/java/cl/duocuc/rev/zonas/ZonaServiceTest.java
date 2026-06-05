package cl.duocuc.rev.zonas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.dto.ZonaResponse;
import cl.duocuc.rev.zonas.dto.ZonaResueltaResponse;
import cl.duocuc.rev.zonas.entity.Zona;
import cl.duocuc.rev.zonas.exception.BusinessRuleException;
import cl.duocuc.rev.zonas.port.WeatherDataPort;
import cl.duocuc.rev.zonas.repository.ComunaRepository;
import cl.duocuc.rev.zonas.repository.ZonaRepository;
import cl.duocuc.rev.zonas.service.ZonaService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ZonaServiceTest {

    private static final double CENTRO_LAT = -33.444;
    private static final double CENTRO_LNG = -70.582;

    @Mock
    private ZonaRepository zonaRepository;

    @Mock
    private ComunaRepository comunaRepository;

    @Mock
    private WeatherDataPort weatherDataPort;

    @InjectMocks
    private ZonaService zonaService;

    @Test
    void crear_zonaValida_persiste() {
        ZonaRequest request = requestBase("Centro", "HIGH", 1200);

        Zona saved = zonaActiva(1L, "Centro", "HIGH", CENTRO_LAT, CENTRO_LNG, 1200);
        when(zonaRepository.save(any())).thenReturn(saved);

        ZonaResponse response = zonaService.crear(request);

        assertEquals("HIGH", response.getNivelRiesgo());
        assertEquals(1200, response.getRadioMetros());
        verify(zonaRepository).save(any());
    }

    @Test
    void crear_nivelInvalido_lanzaExcepcion() {
        ZonaRequest request = requestBase("Test", "CRITICO", 1200);
        assertThrows(BusinessRuleException.class, () -> zonaService.crear(request));
    }

    @Test
    void resolverPunto_solapamiento_eligeMenorRadio() {
        Zona amplia = zonaActiva(1L, "Macro", "LOW", CENTRO_LAT, CENTRO_LNG, 2500);
        Zona especifica = zonaActiva(2L, "Centro", "MEDIUM", CENTRO_LAT, CENTRO_LNG, 800);
        when(zonaRepository.findByActivaTrueOrderByNombreAsc()).thenReturn(List.of(amplia, especifica));

        ZonaResueltaResponse res = zonaService.resolverPunto(CENTRO_LAT, CENTRO_LNG);

        assertEquals(2L, res.getZonaId());
        assertEquals("Centro", res.getNombre());
    }

    @Test
    void resolverPunto_mismoRadio_desempataPorMayorRiesgo() {
        Zona baja = zonaActiva(1L, "A", "LOW", CENTRO_LAT, CENTRO_LNG, 1000);
        Zona alta = zonaActiva(2L, "B", "HIGH", CENTRO_LAT, CENTRO_LNG, 1000);
        when(zonaRepository.findByActivaTrueOrderByNombreAsc()).thenReturn(List.of(baja, alta));

        ZonaResueltaResponse res = zonaService.resolverPunto(CENTRO_LAT, CENTRO_LNG);

        assertEquals(2L, res.getZonaId());
        assertEquals("HIGH", res.getNivelRiesgo());
    }

    @Test
    void resolverPunto_fueraDeTodas_lanza404() {
        Zona lejana = zonaActiva(1L, "Lejana", "LOW", -33.5, -70.7, 500);
        when(zonaRepository.findByActivaTrueOrderByNombreAsc()).thenReturn(List.of(lejana));

        assertThrows(BusinessRuleException.class, () -> zonaService.resolverPunto(CENTRO_LAT, CENTRO_LNG));
    }

    @Test
    void desactivar_marcaInactiva() {
        Zona zona = zonaActiva(5L, "Industrial", "MEDIUM", CENTRO_LAT, CENTRO_LNG, 1500);
        when(zonaRepository.findById(5L)).thenReturn(Optional.of(zona));
        when(zonaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        zonaService.desactivar(5L);

        assertFalse(zona.isActiva());
        verify(zonaRepository).save(zona);
    }

    @Test
    void listar_soloActivas_porDefecto() {
        Zona activa = zonaActiva(1L, "A", "LOW", CENTRO_LAT, CENTRO_LNG, 800);
        when(zonaRepository.findByActivaTrueOrderByNombreAsc()).thenReturn(List.of(activa));

        List<ZonaResponse> list = zonaService.listar(false);

        assertEquals(1, list.size());
        assertTrue(list.get(0).isActiva());
    }

    private static ZonaRequest requestBase(String nombre, String nivel, double radio) {
        ZonaRequest request = new ZonaRequest();
        request.setNombre(nombre);
        request.setNivelRiesgo(nivel);
        request.setCenterLat(CENTRO_LAT);
        request.setCenterLng(CENTRO_LNG);
        request.setRadioMetros(radio);
        request.setTipo("ESTRATEGICA");
        return request;
    }

    private static Zona zonaActiva(
            Long id, String nombre, String nivel, double lat, double lng, double radio) {
        return Zona.builder()
                .id(id)
                .nombre(nombre)
                .nivelRiesgo(nivel)
                .centerLat(lat)
                .centerLng(lng)
                .radioMetros(radio)
                .comuna("Puente Alto")
                .tipo("ESTRATEGICA")
                .activa(true)
                .minLat(lat - 0.01)
                .maxLat(lat + 0.01)
                .minLng(lng - 0.01)
                .maxLng(lng + 0.01)
                .build();
    }
}
