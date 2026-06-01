package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.AdjuntoDto;
import cl.duocuc.rev.bff.dto.IncidenteCreateRequest;
import cl.duocuc.rev.bff.dto.IncidenteDto;
import cl.duocuc.rev.bff.dto.PublicIncidenteCreateRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class IncidenteClientService {

    private static final String BASE_URL = "http://MS-INCIDENTES";

    private final WebClient.Builder webClientBuilder;

    public Mono<IncidenteDto> obtenerPorId(UUID id) {
        return webClient()
                .get()
                .uri("/incidentes/{id}", id)
                .retrieve()
                .bodyToMono(IncidenteDto.class);
    }

    public Mono<List<IncidenteDto>> listar() {
        return webClient()
                .get()
                .uri("/incidentes")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<IncidenteDto> crear(IncidenteCreateRequest request) {
        return webClient()
                .post()
                .uri("/incidentes")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(IncidenteDto.class);
    }

    public Mono<IncidenteDto> crearPublico(PublicIncidenteCreateRequest request) {
        return webClient()
                .post()
                .uri("/incidentes/publicos")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(IncidenteDto.class);
    }

    public Mono<List<AdjuntoDto>> listarAdjuntos(UUID incidenteId) {
        return webClient()
                .get()
                .uri("/incidentes/{id}/adjuntos", incidenteId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<AdjuntoDto> agregarAdjunto(UUID incidenteId, String tipo, MultipartFile file) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("tipo", tipo);
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.bin";
                }
            }).contentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE));

            return webClient()
                    .post()
                    .uri("/incidentes/{id}/adjuntos", incidenteId)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(AdjuntoDto.class);
        } catch (Exception ex) {
            return Mono.error(ex);
        }
    }

    public Mono<byte[]> descargarAdjunto(UUID incidenteId, UUID adjuntoId) {
        return webClient()
                .get()
                .uri("/incidentes/{incidenteId}/adjuntos/{adjuntoId}/archivo", incidenteId, adjuntoId)
                .retrieve()
                .bodyToMono(byte[].class);
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
