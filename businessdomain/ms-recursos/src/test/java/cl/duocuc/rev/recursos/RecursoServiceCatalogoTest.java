package cl.duocuc.rev.recursos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.exception.BusinessRuleException;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.AsignacionRepository;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import cl.duocuc.rev.recursos.repository.VehiculoRepository;
import cl.duocuc.rev.recursos.service.RecursoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RecursoServiceCatalogoTest {

    @Mock
    private BrigadaRepository brigadaRepository;

    @Mock
    private VehiculoRepository vehiculoRepository;

    @Mock
    private HerramientaRepository herramientaRepository;

    @Mock
    private AsignacionRepository asignacionRepository;

    @InjectMocks
    private RecursoService recursoService;

    @Test
    void crearBrigada_valida_persiste() {
        BrigadaRequest request = new BrigadaRequest();
        request.setNombre("Brigada Gamma");
        request.setCapacidad(10);

        Brigada saved = Brigada.builder()
                .id(3L)
                .nombre("Brigada Gamma")
                .capacidad(10)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        when(brigadaRepository.save(any())).thenReturn(saved);

        BrigadaDto dto = recursoService.crearBrigada(request);

        assertEquals("Brigada Gamma", dto.getNombre());
        assertEquals(EstadoRecurso.DISPONIBLE, dto.getEstado());
        verify(brigadaRepository).save(any());
    }

    @Test
    void crearBrigada_sinNombre_lanzaExcepcion() {
        BrigadaRequest request = new BrigadaRequest();
        request.setCapacidad(5);

        assertThrows(BusinessRuleException.class, () -> recursoService.crearBrigada(request));
    }
}
