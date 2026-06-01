package cl.duocuc.rev.incidentes.service;

import java.time.Year;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FolioService {

    private final JdbcTemplate jdbcTemplate;

    public String nextFolio() {
        Long seq = jdbcTemplate.queryForObject("SELECT nextval('incidente_folio_seq')", Long.class);
        if (seq == null) {
            throw new IllegalStateException("No se pudo generar folio");
        }
        return String.format("REV-%d-%05d", Year.now().getValue(), seq);
    }
}
