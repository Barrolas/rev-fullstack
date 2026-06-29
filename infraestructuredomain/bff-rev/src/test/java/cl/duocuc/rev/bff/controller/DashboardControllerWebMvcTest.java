package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.DashboardResponse;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.service.DashboardFacadeService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DashboardController.class)
class DashboardControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardFacadeService dashboardFacadeService;

    @Test
    void obtenerPorIncidente_retornaDashboard() throws Exception {
        UUID id = UUID.randomUUID();
        DashboardResponse dash = DashboardResponse.builder()
                .incidente(IncidenteDto.builder().id(id).folio("REV-1").estado("REPORTADO").build())
                .build();
        when(dashboardFacadeService.obtenerPorIncidenteId(id)).thenReturn(dash);

        mockMvc.perform(get("/api/dashboard/incidente/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidente.folio").value("REV-1"));
    }

    @Test
    void listarIncidentes_conHeaders_retornaLista() throws Exception {
        DashboardResponse dash = DashboardResponse.builder()
                .incidente(IncidenteDto.builder().folio("REV-2").build())
                .build();
        when(dashboardFacadeService.listarDashboards(any())).thenReturn(List.of(dash));

        mockMvc.perform(get("/api/dashboard/incidentes")
                        .header("X-REV-Sub", UUID.randomUUID().toString())
                        .header("X-REV-Username", "desp1")
                        .header("X-REV-Roles", "Despachador"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].incidente.folio").value("REV-2"));
    }
}
