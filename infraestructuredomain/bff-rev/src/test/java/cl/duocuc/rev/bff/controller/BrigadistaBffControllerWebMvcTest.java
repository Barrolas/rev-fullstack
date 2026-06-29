package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.TransicionIncidenteRequest;
import cl.duocuc.rev.bff.service.BrigadistaFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BrigadistaBffController.class)
class BrigadistaBffControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BrigadistaFacadeService brigadistaFacadeService;

    private static final String SUB = UUID.randomUUID().toString();

    @Test
    void misAsignacionesYMiBrigada() throws Exception {
        when(brigadistaFacadeService.misAsignaciones(any()))
                .thenReturn(List.of(AsignacionActivaDto.builder().id(1L).estadoDespacho("EN_CAMINO").build()));
        when(brigadistaFacadeService.miBrigada(any()))
                .thenReturn(BrigadaDetalleDto.builder().id(2L).nombre("Brigada Norte").build());

        mockMvc.perform(get("/api/brigadista/mis-asignaciones")
                        .header("X-REV-Sub", SUB)
                        .header("X-REV-Username", "brig1")
                        .header("X-REV-Roles", "Brigadista"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estadoDespacho").value("EN_CAMINO"));

        mockMvc.perform(get("/api/brigadista/mi-brigada")
                        .header("X-REV-Sub", SUB)
                        .header("X-REV-Username", "brig1")
                        .header("X-REV-Roles", "Brigadista"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Brigada Norte"));
    }

    @Test
    void incidenteAsignado_retornaDashboard() throws Exception {
        UUID id = UUID.randomUUID();
        when(brigadistaFacadeService.incidenteAsignado(any(), eq(id)))
                .thenReturn(DashboardResponse.builder()
                        .incidente(IncidenteDto.builder().id(id).folio("REV-1").build())
                        .build());

        mockMvc.perform(get("/api/brigadista/incidentes/{id}", id)
                        .header("X-REV-Sub", SUB)
                        .header("X-REV-Username", "brig1")
                        .header("X-REV-Roles", "Brigadista"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidente.folio").value("REV-1"));
    }

    @Test
    void estadoDespachoYTransicion() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        ActualizarEstadoDespachoRequest estadoReq = new ActualizarEstadoDespachoRequest();
        estadoReq.setEstadoDespacho("EN_SITIO");
        TransicionIncidenteRequest transReq = new TransicionIncidenteRequest();
        transReq.setEstadoDestino("EN_PROGRESO");

        when(brigadistaFacadeService.avanzarEstadoDespacho(any(), eq(5L), any()))
                .thenReturn(AsignacionActivaDto.builder().id(5L).estadoDespacho("EN_SITIO").build());
        when(brigadistaFacadeService.transicionarIncidente(any(), eq(incidenteId), any()))
                .thenReturn(IncidenteDto.builder().id(incidenteId).estado("EN_PROGRESO").build());

        mockMvc.perform(put("/api/brigadista/asignaciones/{id}/estado-despacho", 5L)
                        .header("X-REV-Sub", SUB)
                        .header("X-REV-Username", "brig1")
                        .header("X-REV-Roles", "Brigadista")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(estadoReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoDespacho").value("EN_SITIO"));

        mockMvc.perform(put("/api/brigadista/incidentes/{id}/transicion", incidenteId)
                        .header("X-REV-Sub", SUB)
                        .header("X-REV-Username", "brig1")
                        .header("X-REV-Roles", "Brigadista")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_PROGRESO"));
    }
}
