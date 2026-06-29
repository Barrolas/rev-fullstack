package cl.duocuc.rev.zonas.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.zonas.dto.RiesgoZonaResponse;
import cl.duocuc.rev.zonas.dto.ZonaRequest;
import cl.duocuc.rev.zonas.dto.ZonaResponse;
import cl.duocuc.rev.zonas.dto.ZonaResueltaResponse;
import cl.duocuc.rev.zonas.service.ZonaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ZonaController.class)
class ZonaControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ZonaService zonaService;

    @Test
    void listar_retorna200() throws Exception {
        when(zonaService.listar(false)).thenReturn(List.of(ZonaResponse.builder().id(1L).nombre("Centro").build()));

        mockMvc.perform(get("/zonas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Centro"));
    }

    @Test
    void resolver_retornaZona() throws Exception {
        when(zonaService.resolverPunto(-33.44, -70.58))
                .thenReturn(ZonaResueltaResponse.builder().zonaId(2L).nombre("Centro").build());

        mockMvc.perform(get("/zonas/resolver").param("lat", "-33.44").param("lng", "-70.58"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.zonaId").value(2));
    }

    @Test
    void consultarRiesgo_retornaClima() throws Exception {
        when(zonaService.consultarRiesgo(-33.44, -70.58))
                .thenReturn(RiesgoZonaResponse.builder().zonaId(1L).nivelRiesgo("HIGH").temperaturaC(25.0).build());

        mockMvc.perform(get("/zonas/riesgo").param("lat", "-33.44").param("lng", "-70.58"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nivelRiesgo").value("HIGH"));
    }

    @Test
    void crear_retorna201() throws Exception {
        ZonaRequest request = new ZonaRequest();
        request.setNombre("Nueva");
        request.setNivelRiesgo("LOW");
        request.setCenterLat(-33.44);
        request.setCenterLng(-70.58);
        request.setRadioMetros(800.0);
        request.setTipo("ESTRATEGICA");
        when(zonaService.crear(any())).thenReturn(ZonaResponse.builder().id(5L).nombre("Nueva").build());

        mockMvc.perform(post("/zonas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Nueva"));
    }

    @Test
    void actualizar_yDesactivar() throws Exception {
        ZonaRequest request = new ZonaRequest();
        request.setNombre("Editada");
        request.setNivelRiesgo("MEDIUM");
        request.setCenterLat(-33.44);
        request.setCenterLng(-70.58);
        request.setRadioMetros(900.0);
        request.setTipo("ESTRATEGICA");
        when(zonaService.actualizar(eq(3L), any()))
                .thenReturn(ZonaResponse.builder().id(3L).nombre("Editada").build());

        mockMvc.perform(put("/zonas/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/zonas/3")).andExpect(status().isNoContent());
        verify(zonaService).desactivar(3L);
    }
}
