package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.ConfirmarCorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionDto;
import cl.duocuc.rev.bff.dto.DescartarCorrelacionDto;
import cl.duocuc.rev.bff.dto.GrupoIncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteResumenDto;
import cl.duocuc.rev.bff.dto.RevertirCorrelacionPreviewDto;
import cl.duocuc.rev.bff.service.CorrelacionFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CorrelacionBffController.class)
class CorrelacionBffControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CorrelacionFacadeService correlacionFacadeService;

    @Test
    void listarCorrelacionesYContar() throws Exception {
        CorrelacionDto corr = CorrelacionDto.builder().id(UUID.randomUUID()).estado("PENDIENTE").build();
        when(correlacionFacadeService.listarPendientes()).thenReturn(List.of(corr));
        when(correlacionFacadeService.listarPorEstado("CONFIRMADA")).thenReturn(List.of());
        when(correlacionFacadeService.listarPorEstado("DESCARTADA")).thenReturn(List.of());
        when(correlacionFacadeService.listarPorEstado("PENDIENTE")).thenReturn(List.of(corr));
        when(correlacionFacadeService.contarPendientes()).thenReturn(3L);

        mockMvc.perform(get("/api/incidentes/correlaciones/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        mockMvc.perform(get("/api/incidentes/correlaciones/confirmadas")).andExpect(status().isOk());

        mockMvc.perform(get("/api/incidentes/correlaciones/descartadas")).andExpect(status().isOk());

        mockMvc.perform(get("/api/incidentes/correlaciones").param("estado", "PENDIENTE"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/incidentes/correlaciones/pendientes/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3));
    }

    @Test
    void obtenerPorFolioYGrupo() throws Exception {
        UUID id = UUID.randomUUID();
        when(correlacionFacadeService.obtenerPorFolio("REV-001"))
                .thenReturn(IncidenteResumenDto.builder().id(id).folio("REV-001").build());
        when(correlacionFacadeService.obtenerGrupo(id))
                .thenReturn(GrupoIncidenteDto.builder().incidenteCanonicoId(id).build());
        when(correlacionFacadeService.listarPorIncidente(id)).thenReturn(List.of());

        mockMvc.perform(get("/api/incidentes/folio/{folio}", "REV-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.folio").value("REV-001"));

        mockMvc.perform(get("/api/incidentes/{id}/grupo", id)).andExpect(status().isOk());

        mockMvc.perform(get("/api/incidentes/{id}/correlaciones", id)).andExpect(status().isOk());
    }

    @Test
    void confirmarDescartarRevertirYReabrir() throws Exception {
        UUID correlacionId = UUID.randomUUID();
        CorrelacionDto corr = CorrelacionDto.builder().id(correlacionId).estado("CONFIRMADA").build();
        ConfirmarCorrelacionDto confirmar = new ConfirmarCorrelacionDto();
        DescartarCorrelacionDto descartar = new DescartarCorrelacionDto();

        when(correlacionFacadeService.confirmar(eq(correlacionId), any(), eq("operador")))
                .thenReturn(corr);
        when(correlacionFacadeService.descartar(eq(correlacionId), any(), eq("operador")))
                .thenReturn(CorrelacionDto.builder().id(correlacionId).estado("DESCARTADA").build());
        when(correlacionFacadeService.previewRevertir(correlacionId))
                .thenReturn(RevertirCorrelacionPreviewDto.builder().bloqueado(false).build());
        when(correlacionFacadeService.revertir(eq(correlacionId), any(), eq("operador")))
                .thenReturn(corr);
        when(correlacionFacadeService.reabrir(correlacionId, "operador"))
                .thenReturn(CorrelacionDto.builder().id(correlacionId).estado("PENDIENTE").build());

        mockMvc.perform(post("/api/incidentes/correlaciones/{id}/confirmar", correlacionId)
                        .header("X-REV-Usuario", "operador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmar)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADA"));

        mockMvc.perform(post("/api/incidentes/correlaciones/{id}/descartar", correlacionId)
                        .header("X-REV-Usuario", "operador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(descartar)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("DESCARTADA"));

        mockMvc.perform(get("/api/incidentes/correlaciones/{id}/revertir/preview", correlacionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloqueado").value(false));

        mockMvc.perform(post("/api/incidentes/correlaciones/{id}/revertir", correlacionId)
                        .header("X-REV-Usuario", "operador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/incidentes/correlaciones/{id}/reabrir", correlacionId)
                        .header("X-REV-Usuario", "operador"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }
}
