package cl.duocuc.rev.incidentes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duocuc.rev.incidentes.dto.AdjuntoResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.dto.PublicIncidenteRequest;
import cl.duocuc.rev.incidentes.model.TipoAdjunto;
import cl.duocuc.rev.incidentes.entity.Incidente;
import cl.duocuc.rev.incidentes.entity.TransicionEstado;
import cl.duocuc.rev.incidentes.exception.BusinessRuleException;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.model.OrigenReporte;
import cl.duocuc.rev.incidentes.repository.IncidenteRepository;
import cl.duocuc.rev.incidentes.repository.TransicionEstadoRepository;
import cl.duocuc.rev.incidentes.state.IncidentStateFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class IncidenteServiceTest {

    @Mock
    private IncidenteRepository incidenteRepository;

    @Mock
    private TransicionEstadoRepository transicionEstadoRepository;

    @Mock
    private IncidentStateFactory stateFactory;

    @Mock
    private FolioService folioService;

    @Mock
    private AdjuntoService adjuntoService;

    @Mock
    private CorrelacionService correlacionService;

    @Mock
    private ZonaAsignacionService zonaAsignacionService;

    @InjectMocks
    private IncidenteService incidenteService;

    @Test
    void crearPublico_sinUbicacion_lanzaValidacion() {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Humo visible");

        assertThrows(BusinessRuleException.class, () -> incidenteService.crearPublico(request));
    }

    @Test
    void crearPublico_conCoordenadas_persisteYEvaluaCorrelacion() {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Humo sector norte");
        request.setLat(-33.45);
        request.setLng(-70.66);

        when(folioService.nextFolio()).thenReturn("REV-2026-0001");
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.crearPublico(request);

        assertEquals("FORESTAL", response.getTipo());
        assertEquals(OrigenReporte.PUBLICO, response.getOrigenReporte());
        verify(correlacionService).evaluarNuevoIncidente(any(UUID.class));
    }

    @Test
    void obtener_noExiste_lanzaNotFound() {
        UUID id = UUID.randomUUID();
        when(incidenteRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () -> incidenteService.obtener(id));
    }

    @Test
    void transicionar_guardaHistorialYActualizaEstado() {
        UUID id = UUID.randomUUID();
        Incidente incidente = Incidente.builder()
                .id(id)
                .estado(EstadoIncidente.REPORTADO)
                .lat(-33.45)
                .lng(-70.66)
                .createdAt(LocalDateTime.now())
                .build();
        when(incidenteRepository.findById(id)).thenReturn(Optional.of(incidente));
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(transicionEstadoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        incidenteService.transicionar(id, EstadoIncidente.EN_PROGRESO, "despachador", "PANEL");

        verify(stateFactory).validarTransicion(incidente, EstadoIncidente.EN_PROGRESO);
        ArgumentCaptor<TransicionEstado> captor = ArgumentCaptor.forClass(TransicionEstado.class);
        verify(transicionEstadoRepository).save(captor.capture());
        assertEquals(EstadoIncidente.EN_PROGRESO, captor.getValue().getEstadoNuevo());
        assertEquals("despachador", captor.getValue().getRealizadoPor());
    }

    @Test
    void timeline_incluyeRegistroYTransiciones() {
        UUID id = UUID.randomUUID();
        LocalDateTime created = LocalDateTime.of(2026, 6, 29, 10, 0);
        Incidente incidente = Incidente.builder()
                .id(id)
                .estado(EstadoIncidente.EN_PROGRESO)
                .origenReporte(OrigenReporte.PUBLICO)
                .createdAt(created)
                .build();
        TransicionEstado transicion = TransicionEstado.builder()
                .incidenteId(id)
                .estadoAnterior(EstadoIncidente.REPORTADO)
                .estadoNuevo(EstadoIncidente.EN_PROGRESO)
                .createdAt(created.plusMinutes(5))
                .realizadoPor("despachador")
                .build();

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(incidente));
        when(transicionEstadoRepository.findByIncidenteIdOrderByCreatedAtAsc(id)).thenReturn(List.of(transicion));

        var items = incidenteService.timeline(id);

        assertEquals(2, items.size());
        assertEquals("REGISTRO", items.get(0).getTipo());
        assertEquals("TRANSICION", items.get(1).getTipo());
    }

    @Test
    void listar_mapeaTodosLosIncidentes() {
        UUID id = UUID.randomUUID();
        Incidente incidente = Incidente.builder()
                .id(id)
                .folio("REV-001")
                .tipo("FORESTAL")
                .estado(EstadoIncidente.REPORTADO)
                .createdAt(LocalDateTime.now())
                .build();
        when(incidenteRepository.findAll()).thenReturn(List.of(incidente));

        var list = incidenteService.listar();

        assertEquals(1, list.size());
        assertEquals("REV-001", list.get(0).getFolio());
    }

    @Test
    void crear_persisteYEvaluaCorrelacion() {
        IncidenteRequest request = new IncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Incendio sector sur");
        request.setLat(-33.45);
        request.setLng(-70.66);

        when(folioService.nextFolio()).thenReturn("REV-2026-0002");
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.crear(request);

        assertEquals("FORESTAL", response.getTipo());
        assertEquals(OrigenReporte.INTERNO, response.getOrigenReporte());
        assertEquals(EstadoIncidente.REPORTADO, response.getEstado());
        verify(zonaAsignacionService).asignarZonaSiAplica(any(Incidente.class));
        verify(correlacionService).evaluarNuevoIncidente(any(UUID.class));
    }

    @Test
    void obtener_existenteIncluyeAdjuntos() {
        UUID id = UUID.randomUUID();
        Incidente incidente = Incidente.builder()
                .id(id)
                .folio("REV-003")
                .tipo("ESTRUCTURAL")
                .estado(EstadoIncidente.REPORTADO)
                .createdAt(LocalDateTime.now())
                .build();
        AdjuntoResponse adjunto = AdjuntoResponse.builder()
                .id(UUID.randomUUID())
                .incidenteId(id)
                .tipo(TipoAdjunto.FOTO)
                .nombreArchivo("evidencia.jpg")
                .build();

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(incidente));
        when(adjuntoService.listar(id)).thenReturn(List.of(adjunto));

        var response = incidenteService.obtener(id);

        assertEquals("REV-003", response.getFolio());
        assertEquals(1, response.getAdjuntos().size());
        assertEquals("evidencia.jpg", response.getAdjuntos().get(0).getNombreArchivo());
    }

    @Test
    void recalcularZonas_delegaAlServicioDeZona() {
        when(zonaAsignacionService.recalcularTodas()).thenReturn(3);

        int count = incidenteService.recalcularZonas();

        assertEquals(3, count);
        verify(zonaAsignacionService).recalcularTodas();
    }

    @Test
    void crearPublico_conDireccionSinCoords_persisteSinEvaluarGps() {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Humo en calle Los Robles 123");
        request.setDireccionReferencia("Los Robles 123, Valle del Sol");

        when(folioService.nextFolio()).thenReturn("REV-2026-0003");
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.crearPublico(request);

        assertEquals("Los Robles 123, Valle del Sol", response.getDireccionReferencia());
        assertNull(response.getLat());
        verify(correlacionService).evaluarNuevoIncidente(any(UUID.class));
    }

    @Test
    void crearPublico_anonimo_noExponeDatosReportante() {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Reporte anonimo");
        request.setLat(-33.45);
        request.setLng(-70.66);
        request.setAnonimo(true);
        request.setReportanteNombre("Juan");
        request.setReportanteApellido("Perez");
        request.setReportanteRut("11111111-1");
        request.setReportanteContacto("+56912345678");

        when(folioService.nextFolio()).thenReturn("REV-2026-0004");
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.crearPublico(request);

        assertTrue(response.isAnonimo());
        assertNull(response.getReportanteNombre());
        assertNull(response.getReportanteApellido());
        assertNull(response.getReportanteRut());
        assertNull(response.getReportanteContacto());
    }

    @Test
    void crearPublico_tipoBlank_lanzaValidacion() {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("   ");
        request.setDescripcion("Descripcion valida");
        request.setLat(-33.45);
        request.setLng(-70.66);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> incidenteService.crearPublico(request));
        assertEquals("VALIDATION", ex.getCode());
        verify(incidenteRepository, never()).save(any());
    }

    @Test
    void crearPublico_descripcionBlank_lanzaValidacion() {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("");
        request.setLat(-33.45);
        request.setLng(-70.66);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> incidenteService.crearPublico(request));
        assertEquals("VALIDATION", ex.getCode());
        verify(incidenteRepository, never()).save(any());
    }

    @Test
    void transicionar_dosParametros_usaValoresPorDefecto() {
        UUID id = UUID.randomUUID();
        Incidente incidente = Incidente.builder()
                .id(id)
                .estado(EstadoIncidente.REPORTADO)
                .createdAt(LocalDateTime.now())
                .build();
        when(incidenteRepository.findById(id)).thenReturn(Optional.of(incidente));
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(transicionEstadoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.transicionar(id, EstadoIncidente.EN_PROGRESO);

        assertEquals(EstadoIncidente.EN_PROGRESO, response.getEstado());
        ArgumentCaptor<TransicionEstado> captor = ArgumentCaptor.forClass(TransicionEstado.class);
        verify(transicionEstadoRepository).save(captor.capture());
        assertNull(captor.getValue().getRealizadoPor());
        assertNull(captor.getValue().getOrigen());
    }

    @Test
    void crearPublico_conReportanteUuid_usaUuidProporcionado() {
        UUID reportanteUuid = UUID.randomUUID();
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Reporte identificado");
        request.setLat(-33.45);
        request.setLng(-70.66);
        request.setReportanteUuid(reportanteUuid);
        request.setReportanteNombre("Maria");
        request.setReportanteApellido("Lopez");

        when(folioService.nextFolio()).thenReturn("REV-2026-0005");
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.crearPublico(request);

        assertEquals(reportanteUuid, response.getReportanteUuid());
        assertEquals("Maria", response.getReportanteNombre());
    }

    @Test
    void crear_trimeaDireccionReferencia() {
        IncidenteRequest request = new IncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Incendio");
        request.setLat(-33.45);
        request.setLng(-70.66);
        request.setDireccionReferencia("  Calle Central  ");

        when(folioService.nextFolio()).thenReturn("REV-2026-0006");
        when(incidenteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = incidenteService.crear(request);

        assertEquals("Calle Central", response.getDireccionReferencia());
    }
}
