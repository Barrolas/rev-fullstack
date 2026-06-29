package cl.duocuc.rev.zonas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.repository.ZonaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ZonaServiceIntegrationTest {

    private static final double LAT = -33.444;
    private static final double LNG = -70.582;

    @Autowired
    private ZonaService zonaService;

    @Autowired
    private ZonaRepository zonaRepository;

    @Test
    void flujoCompleto_crearResolverConsultarRiesgo() {
        ZonaRequest request = new ZonaRequest();
        request.setNombre("Integración Centro");
        request.setNivelRiesgo("HIGH");
        request.setCenterLat(LAT);
        request.setCenterLng(LNG);
        request.setRadioMetros(1500.0);
        request.setTipo("ESTRATEGICA");

        var creada = zonaService.crear(request);
        assertNotNull(creada.getId());

        var resuelta = zonaService.resolverPunto(LAT, LNG);
        assertEquals(creada.getId(), resuelta.getZonaId());

        var riesgo = zonaService.consultarRiesgo(LAT, LNG);
        assertEquals("HIGH", riesgo.getNivelRiesgo());
        assertNotNull(riesgo.getCondicionClimatica());

        zonaService.desactivar(creada.getId());
        assertEquals(0, zonaRepository.findByActivaTrueOrderByNombreAsc().size());
    }
}
