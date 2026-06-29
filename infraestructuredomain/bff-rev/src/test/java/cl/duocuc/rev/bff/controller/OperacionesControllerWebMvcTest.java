package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.client.IncidenteClientService;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.MapaTerritorialResponse;
import cl.duocuc.rev.bff.dto.ZonaDto;
import cl.duocuc.rev.bff.service.MapaTerritorialFacadeService;
import cl.duocuc.rev.bff.service.OperacionesFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Mono;

@WebMvcTest(OperacionesController.class)
class OperacionesControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OperacionesFacadeService operacionesFacadeService;

    @MockitoBean
    private MapaTerritorialFacadeService mapaTerritorialFacadeService;

    @MockitoBean
    private IncidenteClientService incidenteClientService;

    @Test
    void readyYReadyAuth_retornanUp() throws Exception {
        mockMvc.perform(get("/api/ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("bff-rev"));

        mockMvc.perform(get("/api/ready/auth"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.auth").value("verified"));
    }

    @Test
    void crearIncidente_retorna201() throws Exception {
        IncidenteCreateRequest request = new IncidenteCreateRequest();
        request.setTipo("FORESTAL");
        request.setDescripcion("Humo");
        request.setLat(-33.4);
        request.setLng(-70.5);
        UUID id = UUID.randomUUID();
        when(operacionesFacadeService.crearIncidente(any()))
                .thenReturn(IncidenteDto.builder().id(id).tipo("FORESTAL").build());

        mockMvc.perform(post("/api/incidentes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("FORESTAL"));
    }

    @Test
    void listarYCrearZonas() throws Exception {
        ZonaDto zona = ZonaDto.builder().id(1L).nombre("Sector Norte").nivelRiesgo("HIGH").build();
        when(operacionesFacadeService.listarZonas(false)).thenReturn(List.of(zona));
        when(operacionesFacadeService.crearZona(any())).thenReturn(zona);

        mockMvc.perform(get("/api/zonas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Sector Norte"));

        mockMvc.perform(post("/api/zonas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(zona)))
                .andExpect(status().isCreated());
    }

    @Test
    void actualizarYDesactivarZona() throws Exception {
        ZonaDto zona = ZonaDto.builder().id(3L).nombre("Actualizada").build();
        when(operacionesFacadeService.actualizarZona(eq(3L), any())).thenReturn(zona);

        mockMvc.perform(put("/api/zonas/{id}", 3L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(zona)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Actualizada"));

        mockMvc.perform(delete("/api/zonas/{id}", 3L)).andExpect(status().isNoContent());
    }

    @Test
    void recalcularZonasYMapaTerritorial() throws Exception {
        when(operacionesFacadeService.recalcularZonasIncidentes()).thenReturn(4);
        when(mapaTerritorialFacadeService.obtenerMapaTerritorial())
                .thenReturn(MapaTerritorialResponse.builder().incidentesSinUbicacion(2).build());

        mockMvc.perform(post("/api/incidentes/recalcular-zonas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actualizados").value(4));

        mockMvc.perform(get("/api/mapa/territorial"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentesSinUbicacion").value(2));
    }

    @Test
    void listarAdjuntos_delegaAlCliente() throws Exception {
        UUID id = UUID.randomUUID();
        when(incidenteClientService.listarAdjuntos(id)).thenReturn(Mono.just(List.of()));

        mockMvc.perform(get("/api/incidentes/{id}/adjuntos", id)).andExpect(status().isOk());
    }
}
