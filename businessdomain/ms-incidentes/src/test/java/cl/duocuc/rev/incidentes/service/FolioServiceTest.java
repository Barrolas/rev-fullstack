package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.Year;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class FolioServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private FolioService folioService;

    @Test
    void nextFolio_formateaSecuencia() {
        when(jdbcTemplate.queryForObject("SELECT nextval('incidente_folio_seq')", Long.class)).thenReturn(42L);

        String folio = folioService.nextFolio();

        assertEquals("REV-" + Year.now().getValue() + "-00042", folio);
    }

    @Test
    void nextFolio_sinSecuencia_lanzaEstadoInvalido() {
        when(jdbcTemplate.queryForObject("SELECT nextval('incidente_folio_seq')", Long.class)).thenReturn(null);

        assertThrows(IllegalStateException.class, () -> folioService.nextFolio());
    }
}
