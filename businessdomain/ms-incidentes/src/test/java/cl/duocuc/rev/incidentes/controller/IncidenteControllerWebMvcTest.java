package cl.duocuc.rev.incidentes.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.incidentes.dto.IncidenteRequest;
import cl.duocuc.rev.incidentes.dto.IncidenteResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteTimelineItemDto;
import cl.duocuc.rev.incidentes.dto.PublicIncidenteRequest;
import cl.duocuc.rev.incidentes.dto.TransicionRequest;
import cl.duocuc.rev.incidentes.model.EstadoIncidente;
import cl.duocuc.rev.incidentes.service.AdjuntoService;
import cl.duocuc.rev.incidentes.service.AdjuntoStorageService;
import cl.duocuc.rev.incidentes.service.IncidenteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(IncidenteController.class)
class IncidenteControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private IncidenteService incidenteService;

    @MockitoBean
    private AdjuntoService adjuntoService;

    @MockitoBean
    private AdjuntoStorageService adjuntoStorageService;

    @Test
    void listarYRecalcularZonas() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidenteService.listar()).thenReturn(List.of(IncidenteResponse.builder().id(id).folio("REV-1").build()));
        when(incidenteService.recalcularZonas()).thenReturn(3);

        mockMvc.perform(get("/incidentes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].folio").value("REV-1"));

        mockMvc.perform(post("/incidentes/recalcular-zonas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actualizados").value(3));
    }

    @Test
    void crearObtenerTransicionarYTimeline() throws Exception {
        UUID id = UUID.randomUUID();
        IncidenteRequest crear = new IncidenteRequest();
        crear.setTipo("FORESTAL");
        crear.setDescripcion("Humo");
        crear.setLat(-33.4);
        crear.setLng(-70.5);
        when(incidenteService.crear(any())).thenReturn(IncidenteResponse.builder().id(id).tipo("FORESTAL").build());
        when(incidenteService.obtener(id))
                .thenReturn(IncidenteResponse.builder().id(id).estado(EstadoIncidente.REPORTADO).build());
        TransicionRequest trans = new TransicionRequest();
        trans.setEstadoDestino(EstadoIncidente.EN_PROGRESO);
        when(incidenteService.transicionar(eq(id), eq(EstadoIncidente.EN_PROGRESO), any(), any()))
                .thenReturn(IncidenteResponse.builder().id(id).estado(EstadoIncidente.EN_PROGRESO).build());
        when(incidenteService.timeline(id))
                .thenReturn(List.of(IncidenteTimelineItemDto.builder().tipo("REGISTRO").build()));

        mockMvc.perform(post("/incidentes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crear)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/incidentes/{id}", id)).andExpect(status().isOk());

        mockMvc.perform(put("/incidentes/{id}/transicion", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(trans)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/incidentes/{id}/timeline", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("REGISTRO"));
    }

    @Test
    void crearPublico_retorna201() throws Exception {
        PublicIncidenteRequest request = new PublicIncidenteRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Reporte ciudadano");
        request.setLat(-33.4);
        request.setLng(-70.5);
        when(incidenteService.crearPublico(any()))
                .thenReturn(IncidenteResponse.builder().folio("REV-PUB-1").build());

        mockMvc.perform(post("/incidentes/publicos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.folio").value("REV-PUB-1"));
    }
}
