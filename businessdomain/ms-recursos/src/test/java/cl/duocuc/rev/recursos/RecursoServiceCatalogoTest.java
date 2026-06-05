package cl.duocuc.rev.recursos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.dto.HerramientaRequest;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.Herramienta;
import cl.duocuc.rev.recursos.exception.BusinessRuleException;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.AsignacionBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionHerramientaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionRepository;
import cl.duocuc.rev.recursos.repository.BrigadaHerramientaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaVehiculoRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRolRepository;
import cl.duocuc.rev.recursos.repository.ComunaRepository;
import cl.duocuc.rev.recursos.repository.CompaniaRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import cl.duocuc.rev.recursos.repository.InstitucionRepository;
import cl.duocuc.rev.recursos.repository.VehiculoRepository;
import cl.duocuc.rev.recursos.service.RecursoService;
import java.util.List;
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
    private BrigadistaRepository brigadistaRepository;

    @Mock
    private AsignacionRepository asignacionRepository;

    @Mock
    private BrigadaHerramientaRepository brigadaHerramientaRepository;

    @Mock
    private AsignacionBrigadistaRepository asignacionBrigadistaRepository;

    @Mock
    private AsignacionHerramientaRepository asignacionHerramientaRepository;

    @Mock
    private InstitucionRepository institucionRepository;

    @Mock
    private CompaniaRepository companiaRepository;

    @Mock
    private ComunaRepository comunaRepository;

    @Mock
    private BrigadistaRolRepository brigadistaRolRepository;

    @Mock
    private BrigadaVehiculoRepository brigadaVehiculoRepository;

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
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(3L)).thenReturn(List.of());

        BrigadaDto dto = recursoService.crearBrigada(request);

        assertEquals("Brigada Gamma", dto.getNombre());
        assertEquals(EstadoRecurso.DISPONIBLE, dto.getEstado());
        verify(brigadaRepository).save(any());
    }

    @Test
    void crearHerramienta_conFichaCompleta_persiste() {
        HerramientaRequest request = new HerramientaRequest();
        request.setNombre("Extintor PQS");
        request.setCantidadTotal(10);
        request.setMarca("Badger");
        request.setModelo("B10V");
        request.setSku("EXT-PQS-6");
        request.setEstado("ACTIVA");

        Herramienta saved = Herramienta.builder()
                .id(1L)
                .nombre("Extintor PQS")
                .cantidadTotal(10)
                .cantidadDisponible(10)
                .marca("Badger")
                .modelo("B10V")
                .sku("EXT-PQS-6")
                .estado("ACTIVA")
                .build();
        when(herramientaRepository.save(any())).thenReturn(saved);

        var dto = recursoService.crearHerramienta(request);

        assertEquals("Extintor PQS", dto.getNombre());
        assertEquals("Badger", dto.getMarca());
        assertEquals("EXT-PQS-6", dto.getSku());
        assertEquals("ACTIVA", dto.getEstado());
        verify(herramientaRepository).save(any());
    }

    @Test
    void crearBrigada_sinNombre_lanzaExcepcion() {
        BrigadaRequest request = new BrigadaRequest();
        request.setCapacidad(5);

        assertThrows(BusinessRuleException.class, () -> recursoService.crearBrigada(request));
    }
}
