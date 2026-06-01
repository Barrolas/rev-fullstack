package cl.duocuc.rev.bff.controller;

import cl.duocuc.rev.bff.dto.PublicIncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.PublicReportResponse;
import cl.duocuc.rev.bff.service.PublicReportFacadeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Endpoints publicos (sin JWT) para reportes ciudadanos. */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicReportFacadeService publicReportFacadeService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/incidentes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PublicReportResponse reportarIncidente(
            @RequestParam("payload") String payloadJson,
            @RequestParam(value = "fotos", required = false) List<MultipartFile> fotos,
            @RequestParam(value = "video", required = false) MultipartFile video,
            @RequestParam(value = "website", required = false) String honeypot,
            @RequestParam("formLoadedAt") long formLoadedAt,
            @RequestParam(value = "captchaToken", required = false) String captchaToken,
            HttpServletRequest request) throws Exception {

        PublicIncidenteCreateRequest payload = objectMapper.readValue(payloadJson, PublicIncidenteCreateRequest.class);
        String clientIp = resolveClientIp(request);
        return publicReportFacadeService.reportar(
                payload, fotos, video, honeypot, formLoadedAt, captchaToken, clientIp);
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
