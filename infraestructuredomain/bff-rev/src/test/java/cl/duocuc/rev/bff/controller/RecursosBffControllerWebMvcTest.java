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

import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.BrigadaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadaElegibilidadDto;
import cl.duocuc.rev.bff.dto.InstitucionDto;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.service.RecursosFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RecursosBffController.class)
class RecursosBffControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RecursosFacadeService recursosFacadeService;

    @Test
    void listarCatalogosYDisponibles() throws Exception {
        when(recursosFacadeService.listarInstituciones())
                .thenReturn(List.of(InstitucionDto.builder().id(1L).nombre("Bomberos").build()));
        when(recursosFacadeService.listarCatalogo())
                .thenReturn(RecursosCatalogoDto.builder().build());
        when(recursosFacadeService.listarDisponibles())
                .thenReturn(RecursosDisponiblesDto.builder()
                        .brigadas(List.of(RecursosDisponiblesDto.BrigadaItemDto.builder()
                                .id(2L)
                                .nombre("Brigada Norte")
                                .build()))
                        .build());

        mockMvc.perform(get("/api/recursos/instituciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Bomberos"));

        mockMvc.perform(get("/api/recursos/catalogo")).andExpect(status().isOk());

        mockMvc.perform(get("/api/recursos/disponibles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brigadas[0].nombre").value("Brigada Norte"));
    }

    @Test
    void obtenerBrigadaYElegibilidad() throws Exception {
        when(recursosFacadeService.obtenerBrigada(3L))
                .thenReturn(BrigadaDetalleDto.builder().id(3L).nombre("Brigada Sur").build());
        when(recursosFacadeService.elegibilidadDespacho(3L))
                .thenReturn(BrigadaElegibilidadDto.builder().listaParaDespacho(true).build());

        mockMvc.perform(get("/api/recursos/brigadas/{id}", 3L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Brigada Sur"));

        mockMvc.perform(get("/api/recursos/brigadas/{id}/elegibilidad-despacho", 3L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listaParaDespacho").value(true));
    }

    @Test
    void crearBrigadaYAsignar() throws Exception {
        BrigadaCreateRequest crear = new BrigadaCreateRequest();
        crear.setNombre("Nueva Brigada");
        when(recursosFacadeService.crearBrigada(any()))
                .thenReturn(RecursosDisponiblesDto.BrigadaItemDto.builder().id(5L).nombre("Nueva Brigada").build());

        AsignarRecursoRequest asignar = new AsignarRecursoRequest();
        asignar.setIncidenteId(UUID.randomUUID());
        asignar.setBrigadaId(5L);
        when(recursosFacadeService.asignarRecurso(any()))
                .thenReturn(AsignacionDto.builder().id(10L).build());

        mockMvc.perform(post("/api/recursos/brigadas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crear)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Nueva Brigada"));

        mockMvc.perform(post("/api/recursos/asignar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asignar)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    void desasignar_retorna204() throws Exception {
        doNothing().when(recursosFacadeService).desasignar(7L);

        mockMvc.perform(delete("/api/recursos/asignar/{id}", 7L)).andExpect(status().isNoContent());
    }
}
