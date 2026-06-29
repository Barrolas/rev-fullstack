package cl.duocuc.rev.incidentes.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.incidentes.dto.ConfirmarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.CorrelacionResponse;
import cl.duocuc.rev.incidentes.dto.CorrelacionResumenResponse;
import cl.duocuc.rev.incidentes.dto.DescartarCorrelacionRequest;
import cl.duocuc.rev.incidentes.dto.GrupoIncidenteResponse;
import cl.duocuc.rev.incidentes.dto.IncidenteResumen;
import cl.duocuc.rev.incidentes.dto.ResumenBatchRequest;
import cl.duocuc.rev.incidentes.dto.VincularIncidenteRequest;
import cl.duocuc.rev.incidentes.model.EstadoCorrelacion;
import cl.duocuc.rev.incidentes.service.CorrelacionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CorrelacionController.class)
class CorrelacionControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CorrelacionService correlacionService;

    @Test
    void listadosYConsultas() throws Exception {
        UUID corrId = UUID.randomUUID();
        UUID incId = UUID.randomUUID();
        when(correlacionService.listarPendientes()).thenReturn(List.of());
        when(correlacionService.listarPorEstado(EstadoCorrelacion.CONFIRMADA)).thenReturn(List.of());
        when(correlacionService.obtener(corrId))
                .thenReturn(CorrelacionResponse.builder().id(corrId).estado(EstadoCorrelacion.PENDIENTE).build());
        when(correlacionService.obtenerPorFolio("REV-001"))
                .thenReturn(IncidenteResumen.builder().id(incId).folio("REV-001").build());
        when(correlacionService.listarPorIncidente(incId)).thenReturn(List.of());
        when(correlacionService.obtenerGrupo(incId))
                .thenReturn(GrupoIncidenteResponse.builder().incidenteCanonicoId(incId).build());

        mockMvc.perform(get("/incidentes/correlaciones/pendientes")).andExpect(status().isOk());
        mockMvc.perform(get("/incidentes/correlaciones/confirmadas")).andExpect(status().isOk());
        mockMvc.perform(get("/incidentes/correlaciones/{id}", corrId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
        mockMvc.perform(get("/incidentes/folio/{folio}", "REV-001"))
                .andExpect(jsonPath("$.folio").value("REV-001"));
        mockMvc.perform(get("/incidentes/{id}/correlaciones", incId)).andExpect(status().isOk());
        mockMvc.perform(get("/incidentes/{id}/grupo", incId)).andExpect(status().isOk());
    }

    @Test
    void resumenesBatch() throws Exception {
        UUID incId = UUID.randomUUID();
        ResumenBatchRequest request = new ResumenBatchRequest();
        request.setIncidenteIds(List.of(incId));
        when(correlacionService.resumenes(List.of(incId)))
                .thenReturn(List.of(CorrelacionResumenResponse.builder().incidenteId(incId).build()));

        mockMvc.perform(post("/incidentes/correlaciones/resumen")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].incidenteId").value(incId.toString()));
    }

    @Test
    void accionesCorrelacion() throws Exception {
        UUID corrId = UUID.randomUUID();
        UUID incId = UUID.randomUUID();
        CorrelacionResponse response = CorrelacionResponse.builder().id(corrId).estado(EstadoCorrelacion.CONFIRMADA).build();
        when(correlacionService.confirmar(eq(corrId), any(), any())).thenReturn(response);
        when(correlacionService.descartar(eq(corrId), any(), any())).thenReturn(response);
        when(correlacionService.revertir(corrId, "op")).thenReturn(response);
        when(correlacionService.reabrir(corrId, "op")).thenReturn(response);
        when(correlacionService.vincularManual(eq(incId), any(), any()))
                .thenReturn(IncidenteResumen.builder().id(incId).build());

        ConfirmarCorrelacionRequest confirmar = new ConfirmarCorrelacionRequest();
        mockMvc.perform(post("/incidentes/correlaciones/{id}/confirmar", corrId)
                        .header("X-REV-Usuario", "op")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmar)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/incidentes/correlaciones/{id}/descartar", corrId)
                        .header("X-REV-Usuario", "op")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DescartarCorrelacionRequest())))
                .andExpect(status().isOk());

        mockMvc.perform(post("/incidentes/correlaciones/{id}/revertir", corrId).header("X-REV-Usuario", "op"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/incidentes/correlaciones/{id}/reabrir", corrId).header("X-REV-Usuario", "op"))
                .andExpect(status().isOk());

        VincularIncidenteRequest vincular = new VincularIncidenteRequest();
        mockMvc.perform(post("/incidentes/{id}/vincular", incId)
                        .header("X-REV-Usuario", "op")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vincular)))
                .andExpect(status().isOk());

        verify(correlacionService).confirmar(eq(corrId), any(), eq("op"));
    }
}
