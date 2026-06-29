package cl.duocuc.rev.recursos.controller;

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

import cl.duocuc.rev.recursos.dto.AsignacionActivaDto;
import cl.duocuc.rev.recursos.dto.AsignacionResponse;
import cl.duocuc.rev.recursos.dto.BrigadaDetalleDto;
import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.BrigadaElegibilidadDto;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.dto.HerramientaDto;
import cl.duocuc.rev.recursos.dto.HerramientaRequest;
import cl.duocuc.rev.recursos.dto.RecursosCatalogoResponse;
import cl.duocuc.rev.recursos.dto.RecursosDisponiblesResponse;
import cl.duocuc.rev.recursos.service.RecursoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RecursoController.class)
class RecursoControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RecursoService recursoService;

    @Test
    void catalogoYDisponibles() throws Exception {
        when(recursoService.listarInstituciones()).thenReturn(List.of());
        when(recursoService.listarCompanias()).thenReturn(List.of());
        when(recursoService.listarComunas()).thenReturn(List.of());
        when(recursoService.listarBrigadistaRoles()).thenReturn(List.of());
        when(recursoService.listarCatalogo()).thenReturn(RecursosCatalogoResponse.builder().build());
        when(recursoService.listarDisponibles()).thenReturn(RecursosDisponiblesResponse.builder().build());

        mockMvc.perform(get("/recursos/instituciones")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/catalogo")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/disponibles")).andExpect(status().isOk());
    }

    @Test
    void crearBrigadaYHerramienta() throws Exception {
        BrigadaRequest brigada = new BrigadaRequest();
        brigada.setNombre("Alpha");
        brigada.setCapacidad(8);
        when(recursoService.crearBrigada(any()))
                .thenReturn(BrigadaDto.builder().id(1L).nombre("Alpha").build());

        HerramientaRequest herramienta = new HerramientaRequest();
        herramienta.setNombre("Manguera");
        herramienta.setCantidadTotal(5);
        when(recursoService.crearHerramienta(any()))
                .thenReturn(HerramientaDto.builder().id(2L).nombre("Manguera").build());

        mockMvc.perform(post("/recursos/brigadas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(brigada)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Alpha"));

        mockMvc.perform(post("/recursos/herramientas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(herramienta)))
                .andExpect(status().isCreated());
    }

    @Test
    void asignacionesYDesasignar() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        when(recursoService.listarAsignacionesActivas()).thenReturn(List.of());
        when(recursoService.listarAsignacionesPorIncidente(incidenteId))
                .thenReturn(List.of(AsignacionActivaDto.builder().id(9L).build()));

        mockMvc.perform(get("/recursos/asignaciones/activas")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/incidente/{id}/asignaciones-activas", incidenteId)).andExpect(status().isOk());
        mockMvc.perform(delete("/recursos/asignar/{id}", 9L)).andExpect(status().isNoContent());
        verify(recursoService).desasignar(9L);
    }

    @Test
    void endpointsBrigadasYAsignaciones() throws Exception {
        UUID incidenteId = UUID.randomUUID();
        when(recursoService.obtenerBrigadaDetalle(1L)).thenReturn(BrigadaDetalleDto.builder().id(1L).build());
        when(recursoService.listarVehiculosBrigada(1L)).thenReturn(List.of());
        when(recursoService.evaluarElegibilidadDespacho(1L))
                .thenReturn(BrigadaElegibilidadDto.builder().brigadaId(1L).listaParaDespacho(false).build());
        when(recursoService.obtenerAsignacionActiva(9L))
                .thenReturn(AsignacionActivaDto.builder().id(9L).build());
        when(recursoService.listarPorIncidente(incidenteId)).thenReturn(List.of());
        when(recursoService.listarAsignacionesActivasPorBrigada(1L)).thenReturn(List.of());
        when(recursoService.listarIncidenteIdsActivosPorBrigada(1L)).thenReturn(List.of());

        mockMvc.perform(get("/recursos/brigadas/1")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/brigadas/1/vehiculos")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/brigadas/1/elegibilidad-despacho")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/asignaciones/9")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/incidente/{id}", incidenteId)).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/brigadas/1/asignaciones-activas")).andExpect(status().isOk());
        mockMvc.perform(get("/recursos/brigadas/1/incidentes-activos")).andExpect(status().isOk());
        mockMvc.perform(delete("/recursos/incidente/{id}/asignaciones", incidenteId)).andExpect(status().isNoContent());
    }
}
