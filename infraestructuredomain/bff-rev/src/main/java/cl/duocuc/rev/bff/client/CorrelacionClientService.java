package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.ConfirmarCorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionDto;
import cl.duocuc.rev.bff.dto.CorrelacionResumenDto;
import cl.duocuc.rev.bff.dto.DescartarCorrelacionDto;
import cl.duocuc.rev.bff.dto.GrupoIncidenteDto;
import cl.duocuc.rev.bff.dto.IncidenteResumenDto;
import cl.duocuc.rev.bff.dto.ResumenBatchDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CorrelacionClientService {

    private static final String BASE_URL = "http://MS-INCIDENTES";

    private final WebClient.Builder webClientBuilder;

    public Mono<List<CorrelacionDto>> listarPendientes() {
        return listarPorEstado("PENDIENTE");
    }

    public Mono<List<CorrelacionDto>> listarPorEstado(String estado) {
        String segment = switch (estado != null ? estado.toUpperCase() : "PENDIENTE") {
            case "CONFIRMADA" -> "confirmadas";
            case "DESCARTADA" -> "descartadas";
            case "PENDIENTE" -> "pendientes";
            default -> null;
        };
        if (segment != null) {
            return webClient()
                    .get()
                    .uri("/incidentes/correlaciones/{segment}", segment)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<>() {
                    });
        }
        return webClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/incidentes/correlaciones")
                        .queryParam("estado", estado)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<CorrelacionDto> obtener(UUID correlacionId) {
        return webClient()
                .get()
                .uri("/incidentes/correlaciones/{id}", correlacionId)
                .retrieve()
                .bodyToMono(CorrelacionDto.class);
    }

    public Mono<List<CorrelacionResumenDto>> resumenes(List<UUID> incidenteIds) {
        ResumenBatchDto body = new ResumenBatchDto();
        body.setIncidenteIds(incidenteIds);
        return webClient()
                .post()
                .uri("/incidentes/correlaciones/resumen")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<CorrelacionResumenDto> resumen(UUID incidenteId) {
        return resumenes(List.of(incidenteId)).map(list -> list.isEmpty()
                ? CorrelacionResumenDto.builder().incidenteId(incidenteId).build()
                : list.get(0));
    }

    public Mono<GrupoIncidenteDto> obtenerGrupo(UUID incidenteId) {
        return webClient()
                .get()
                .uri("/incidentes/{id}/grupo", incidenteId)
                .retrieve()
                .bodyToMono(GrupoIncidenteDto.class);
    }

    public Mono<List<CorrelacionDto>> listarPorIncidente(UUID incidenteId) {
        return webClient()
                .get()
                .uri("/incidentes/{id}/correlaciones", incidenteId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<IncidenteResumenDto> obtenerPorFolio(String folio) {
        return webClient()
                .get()
                .uri("/incidentes/folio/{folio}", folio)
                .retrieve()
                .bodyToMono(IncidenteResumenDto.class);
    }

    public Mono<CorrelacionDto> confirmar(UUID correlacionId, ConfirmarCorrelacionDto request, String usuario) {
        return webClient()
                .post()
                .uri("/incidentes/correlaciones/{id}/confirmar", correlacionId)
                .header("X-REV-Usuario", usuario != null ? usuario : "sistema")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(CorrelacionDto.class);
    }

    public Mono<CorrelacionDto> descartar(
            UUID correlacionId, DescartarCorrelacionDto request, String usuario) {
        return webClient()
                .post()
                .uri("/incidentes/correlaciones/{id}/descartar", correlacionId)
                .header("X-REV-Usuario", usuario != null ? usuario : "sistema")
                .bodyValue(request != null ? request : new DescartarCorrelacionDto())
                .retrieve()
                .bodyToMono(CorrelacionDto.class);
    }

    public Mono<CorrelacionDto> revertir(UUID correlacionId, String usuario) {
        return webClient()
                .post()
                .uri("/incidentes/correlaciones/{id}/revertir", correlacionId)
                .header("X-REV-Usuario", usuario != null ? usuario : "sistema")
                .retrieve()
                .bodyToMono(CorrelacionDto.class);
    }

    public Mono<CorrelacionDto> reabrir(UUID correlacionId, String usuario) {
        return webClient()
                .post()
                .uri("/incidentes/correlaciones/{id}/reabrir", correlacionId)
                .header("X-REV-Usuario", usuario != null ? usuario : "sistema")
                .retrieve()
                .bodyToMono(CorrelacionDto.class);
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
