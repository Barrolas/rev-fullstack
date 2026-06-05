package cl.duocuc.rev.recursos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.entity.Brigada;
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
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RecursoServiceAsignarMultiTest {

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
    void asignar_mismaBrigadaMismoIncidente_lanzaDuplicada() {
        UUID incidenteId = UUID.randomUUID();
        AsignarRequest request = new AsignarRequest();
        request.setIncidenteId(incidenteId);
        request.setBrigadaId(1L);
        request.setUsarComposicionBrigada(false);

        when(asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, 1L))
                .thenReturn(true);
        when(brigadaRepository.findById(1L))
                .thenReturn(Optional.of(Brigada.builder()
                        .id(1L)
                        .nombre("B1")
                        .capacidad(4)
                        .estado(EstadoRecurso.DISPONIBLE)
                        .build()));

        BusinessRuleException ex =
                assertThrows(BusinessRuleException.class, () -> recursoService.asignar(request));
        assertEquals("ASIGNACION_DUPLICADA", ex.getCode());
    }

    @Test
    void asignar_sinComposicion_noExigeListaParaDespachoCompleta() {
        UUID incidenteId = UUID.randomUUID();
        AsignarRequest request = new AsignarRequest();
        request.setIncidenteId(incidenteId);
        request.setBrigadaId(2L);
        request.setUsarComposicionBrigada(false);
        request.setDespachadoPor("test");

        when(asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, 2L))
                .thenReturn(false);
        when(brigadaRepository.findById(2L))
                .thenReturn(Optional.of(Brigada.builder()
                        .id(2L)
                        .nombre("B2")
                        .capacidad(8)
                        .estado(EstadoRecurso.DISPONIBLE)
                        .build()));
        when(brigadaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionRepository.save(any())).thenAnswer(inv -> {
            var a = inv.getArgument(0, cl.duocuc.rev.recursos.entity.Asignacion.class);
            a.setId(99L);
            return a;
        });
        when(brigadistaRepository.findByIdBrigada(2L)).thenReturn(List.of());
        when(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(2L)).thenReturn(List.of());
        when(brigadaHerramientaRepository.findByBrigadaId(2L)).thenReturn(List.of());

        var response = recursoService.asignar(request);
        assertEquals(99L, response.getId());
    }
}
