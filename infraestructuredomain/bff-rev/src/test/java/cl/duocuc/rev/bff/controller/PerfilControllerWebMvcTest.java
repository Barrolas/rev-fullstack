package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.PerfilOperativoDto;
import cl.duocuc.rev.bff.security.AuthorizationService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PerfilController.class)
class PerfilControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthorizationService authorizationService;

    @Test
    void operativo_retornaPerfil() throws Exception {
        when(authorizationService.resolverPerfil(any()))
                .thenReturn(PerfilOperativoDto.builder()
                        .operador(true)
                        .username("desp1")
                        .build());

        mockMvc.perform(get("/api/perfil/operativo")
                        .header("X-REV-Sub", UUID.randomUUID().toString())
                        .header("X-REV-Username", "desp1")
                        .header("X-REV-Roles", "Despachador"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operador").value(true))
                .andExpect(jsonPath("$.username").value("desp1"));
    }
}
