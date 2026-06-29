package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.client.ZonaResolverClient;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ZonaAsignacionServiceTest {

    @Mock
    private ZonaResolverClient zonaResolverClient;

    @Mock
    private IncidenteRepository incidenteRepository;

    @InjectMocks
    private ZonaAsignacionService zonaAsignacionService;

    @Test
    void asignarZonaSiAplica_sinGps_limpiaCamposZona() {
        Incidente incidente = Incidente.builder()
                .id(UUID.randomUUID())
                .zonaId(1L)
                .zonaNombre("Zona previa")
                .zonaNivelRiesgo("ALTO")
                .build();

        zonaAsignacionService.asignarZonaSiAplica(incidente);

        assertNull(incidente.getZonaId());
        assertNull(incidente.getZonaNombre());
        assertNull(incidente.getZonaNivelRiesgo());
        verify(zonaResolverClient, never()).resolver(any(Double.class), any(Double.class));
    }

    @Test
    void asignarZonaSiAplica_conGps_resuelveYAsignaZona() {
        Incidente incidente = Incidente.builder()
                .id(UUID.randomUUID())
                .lat(-33.45)
                .lng(-70.66)
                .build();
        ZonaResolverClient.ZonaResuelta zona = new ZonaResolverClient.ZonaResuelta();
        zona.setZonaId(42L);
        zona.setNombre("Sector Norte");
        zona.setNivelRiesgo("MEDIO");

        when(zonaResolverClient.resolver(-33.45, -70.66)).thenReturn(Optional.of(zona));

        zonaAsignacionService.asignarZonaSiAplica(incidente);

        assertEquals(42L, incidente.getZonaId());
        assertEquals("Sector Norte", incidente.getZonaNombre());
        assertEquals("MEDIO", incidente.getZonaNivelRiesgo());
    }

    @Test
    void asignarZonaSiAplica_sinZonaEncontrada_limpiaCampos() {
        Incidente incidente = Incidente.builder()
                .id(UUID.randomUUID())
                .lat(-33.45)
                .lng(-70.66)
                .zonaId(99L)
                .zonaNombre("Antigua")
                .zonaNivelRiesgo("BAJO")
                .build();

        when(zonaResolverClient.resolver(-33.45, -70.66)).thenReturn(Optional.empty());

        zonaAsignacionService.asignarZonaSiAplica(incidente);

        assertNull(incidente.getZonaId());
        assertNull(incidente.getZonaNombre());
        assertNull(incidente.getZonaNivelRiesgo());
    }

    @Test
    void recalcularTodas_soloIncidentesConGps() {
        Incidente conGps = Incidente.builder()
                .id(UUID.randomUUID())
                .lat(-33.45)
                .lng(-70.66)
                .build();
        Incidente sinGps = Incidente.builder()
                .id(UUID.randomUUID())
                .direccionReferencia("Sin coordenadas")
                .build();
        ZonaResolverClient.ZonaResuelta zona = new ZonaResolverClient.ZonaResuelta();
        zona.setZonaId(7L);
        zona.setNombre("Centro");
        zona.setNivelRiesgo("ALTO");

        when(incidenteRepository.findAll()).thenReturn(List.of(conGps, sinGps));
        when(zonaResolverClient.resolver(-33.45, -70.66)).thenReturn(Optional.of(zona));

        int count = zonaAsignacionService.recalcularTodas();

        assertEquals(1, count);
        assertEquals(7L, conGps.getZonaId());
        verify(incidenteRepository).saveAll(List.of(conGps));
    }
}
