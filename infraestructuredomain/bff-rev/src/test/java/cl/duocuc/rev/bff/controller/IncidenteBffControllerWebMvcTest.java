package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.BrigadistaOperativoDto;
import cl.duocuc.rev.bff.dto.IncidenteTimelineItemDto;
import cl.duocuc.rev.bff.security.AuthorizationService;
import cl.duocuc.rev.bff.service.IncidenteFacadeService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(IncidenteBffController.class)
class IncidenteBffControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IncidenteFacadeService incidenteFacadeService;

    @MockitoBean
    private AuthorizationService authorizationService;

    @Test
    void timeline_operador_noValidaBrigada() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidenteFacadeService.timeline(id))
                .thenReturn(List.of(IncidenteTimelineItemDto.builder().tipo("REGISTRO").build()));

        mockMvc.perform(get("/api/incidentes/{id}/timeline", id)
                        .header("X-REV-Username", "desp1")
                        .header("X-REV-Roles", "Despachador"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("REGISTRO"));

        verify(authorizationService, never()).requireBrigadista(any());
    }

    @Test
    void timeline_brigadista_validaAcceso() throws Exception {
        UUID id = UUID.randomUUID();
        UUID sub = UUID.randomUUID();
        BrigadistaOperativoDto perfil = BrigadistaOperativoDto.builder()
                .brigadistaId(10L)
                .brigadaId(2L)
                .build();
        when(authorizationService.requireBrigadista(any())).thenReturn(perfil);
        when(incidenteFacadeService.timeline(id))
                .thenReturn(List.of(IncidenteTimelineItemDto.builder().tipo("TRANSICION").estado("EN_PROGRESO").build()));

        mockMvc.perform(get("/api/incidentes/{id}/timeline", id)
                        .header("X-REV-Sub", sub.toString())
                        .header("X-REV-Username", "brig1")
                        .header("X-REV-Roles", "Brigadista"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estado").value("EN_PROGRESO"));

        verify(authorizationService).requireAccesoIncidenteBrigada(perfil, id);
    }
}
