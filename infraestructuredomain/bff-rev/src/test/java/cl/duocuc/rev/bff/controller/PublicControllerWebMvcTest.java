package cl.duocuc.rev.bff.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duocuc.rev.bff.dto.PublicIncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.PublicReportResponse;
import cl.duocuc.rev.bff.service.PublicReportFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PublicController.class)
class PublicControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PublicReportFacadeService publicReportFacadeService;

    @Test
    void reportarIncidente_retorna201() throws Exception {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setTipo("FORESTAL");
        payload.setDescripcion("Humo visible");
        payload.setLat(-33.4);
        payload.setLng(-70.5);
        UUID id = UUID.randomUUID();
        when(publicReportFacadeService.reportar(
                        any(), any(), any(), any(), anyLong(), any(), any()))
                .thenReturn(PublicReportResponse.builder()
                        .id(id.toString())
                        .folio("REV-PUB-1")
                        .mensaje("Su reporte fue recibido. Folio: REV-PUB-1")
                        .build());

        mockMvc.perform(multipart("/api/public/incidentes")
                        .param("payload", objectMapper.writeValueAsString(payload))
                        .param("formLoadedAt", String.valueOf(Instant.now().minusSeconds(10).toEpochMilli()))
                        .param("captchaToken", "token")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.folio").value("REV-PUB-1"));

        verify(publicReportFacadeService).reportar(any(), any(), any(), any(), anyLong(), any(), any());
    }

    @Test
    void reportarIncidente_conForwardedFor_resuelveIpCliente() throws Exception {
        PublicIncidenteCreateRequest payload = new PublicIncidenteCreateRequest();
        payload.setTipo("FORESTAL");
        payload.setLat(-33.4);
        payload.setLng(-70.5);
        when(publicReportFacadeService.reportar(
                        any(), any(), any(), any(), anyLong(), any(), any()))
                .thenReturn(PublicReportResponse.builder().mensaje("Su reporte fue recibido").build());

        mockMvc.perform(multipart("/api/public/incidentes")
                        .param("payload", objectMapper.writeValueAsString(payload))
                        .param("formLoadedAt", String.valueOf(Instant.now().minusSeconds(10).toEpochMilli()))
                        .header("X-Forwarded-For", "192.168.1.10, 10.0.0.1")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated());

        verify(publicReportFacadeService)
                .reportar(any(), any(), any(), any(), anyLong(), any(), eq("192.168.1.10"));
    }
}
