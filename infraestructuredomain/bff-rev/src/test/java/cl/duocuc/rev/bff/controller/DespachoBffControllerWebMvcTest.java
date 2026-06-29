package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarItemDto;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteRequest;
import cl.duocuc.rev.bff.dto.DespachoAsignarLoteResponse;
import cl.duocuc.rev.bff.dto.DespachoColaItemDto;
import cl.duocuc.rev.bff.dto.DespachoColaResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.service.DespachoFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DespachoBffController.class)
class DespachoBffControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DespachoFacadeService despachoFacadeService;

    @Test
    void cola_retornaColaDespacho() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        DespachoColaResponse response = DespachoColaResponse.builder()
                .cola(List.of(DespachoColaItemDto.builder()
                        .incidenteId(incidenteId)
                        .folio("REV-1")
                        .prioridad(25)
                        .build()))
                .build();
        when(despachoFacadeService.obtenerCola()).thenReturn(response);

        mockMvc.perform(get("/api/despacho/cola"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cola[0].folio").value("REV-1"));
    }

    @Test
    void activos_retornaAsignaciones() throws Exception {
        when(despachoFacadeService.listarActivos())
                .thenReturn(List.of(AsignacionActivaDto.builder().id(1L).estadoDespacho("EN_CAMINO").build()));

        mockMvc.perform(get("/api/despacho/activos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estadoDespacho").value("EN_CAMINO"));
    }

    @Test
    void asignarLote_retornaResultados() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        DespachoAsignarLoteRequest request = DespachoAsignarLoteRequest.builder()
                .incidenteId(incidenteId)
                .items(List.of(DespachoAsignarItemDto.builder().brigadaId(2L).build()))
                .build();
        DespachoAsignarLoteResponse response = DespachoAsignarLoteResponse.builder()
                .exitosos(1)
                .fallidos(0)
                .build();
        when(despachoFacadeService.asignarLote(any())).thenReturn(response);

        mockMvc.perform(post("/api/despacho/asignar-lote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitosos").value(1));
    }

    @Test
    void asignacionesIncidenteYActualizarEstado() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        when(despachoFacadeService.listarAsignacionesIncidente(incidenteId))
                .thenReturn(List.of(AsignacionActivaDto.builder().id(5L).incidenteId(incidenteId).build()));
        ActualizarEstadoDespachoRequest estadoRequest = new ActualizarEstadoDespachoRequest();
        estadoRequest.setEstadoDespacho("EN_SITIO");
        when(despachoFacadeService.actualizarEstadoAsignacion(eq(5L), any()))
                .thenReturn(AsignacionActivaDto.builder().id(5L).estadoDespacho("EN_SITIO").build());

        mockMvc.perform(get("/api/despacho/incidentes/{id}/asignaciones", incidenteId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5));

        mockMvc.perform(put("/api/despacho/asignaciones/{id}/estado", 5L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(estadoRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoDespacho").value("EN_SITIO"));
    }

    @Test
    void liberarAsignaciones_retorna204() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        doNothing().when(despachoFacadeService).liberarAsignacionesIncidente(incidenteId);

        mockMvc.perform(delete("/api/despacho/incidentes/{id}/asignaciones", incidenteId))
                .andExpect(status().isNoContent());
    }

    @Test
    void cerrarIncidente_retornaIncidenteCerrado() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        when(despachoFacadeService.cerrarIncidente(incidenteId))
                .thenReturn(IncidenteDto.builder().id(incidenteId).estado("CERRADO").folio("REV-99").build());

        mockMvc.perform(post("/api/despacho/incidentes/{id}/cerrar", incidenteId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CERRADO"))
                .andExpect(jsonPath("$.folio").value("REV-99"));
    }
}
