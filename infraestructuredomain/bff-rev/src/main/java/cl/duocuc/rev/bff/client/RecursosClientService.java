package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.bff.dto.BrigadaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadistaCreateRequest;
import cl.duocuc.rev.bff.dto.HerramientaCreateRequest;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.RecursoDto;
import cl.duocuc.rev.bff.dto.VehiculoCreateRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RecursosClientService {

    private static final String BASE_URL = "http://MS-RECURSOS";

    private final WebClient.Builder webClientBuilder;

    public Mono<List<RecursoDto>> listarPorIncidente(UUID incidenteId) {
        return webClient()
                .get()
                .uri("/recursos/incidente/{incidenteId}", incidenteId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<RecursosCatalogoDto> listarCatalogo() {
        return webClient()
                .get()
                .uri("/recursos/catalogo")
                .retrieve()
                .bodyToMono(RecursosCatalogoDto.class);
    }

    public Mono<RecursosDisponiblesDto> listarDisponibles() {
        return webClient()
                .get()
                .uri("/recursos/disponibles")
                .retrieve()
                .bodyToMono(RecursosDisponiblesDto.class);
    }

    public Mono<BrigadaDetalleDto> obtenerBrigada(Long id) {
        return webClient()
                .get()
                .uri("/recursos/brigadas/{id}", id)
                .retrieve()
                .bodyToMono(BrigadaDetalleDto.class);
    }

    public Mono<BrigadaDetalleDto> actualizarComposicion(Long id, BrigadaComposicionRequest request) {
        return webClient()
                .put()
                .uri("/recursos/brigadas/{id}/composicion", id)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(BrigadaDetalleDto.class);
    }

    public Mono<RecursosDisponiblesDto.BrigadaItemDto> crearBrigada(BrigadaCreateRequest request) {
        return webClient()
                .post()
                .uri("/recursos/brigadas")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RecursosDisponiblesDto.BrigadaItemDto.class);
    }

    public Mono<RecursosCatalogoDto.BrigadistaItemDto> crearBrigadista(BrigadistaCreateRequest request) {
        return webClient()
                .post()
                .uri("/recursos/brigadistas")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RecursosCatalogoDto.BrigadistaItemDto.class);
    }

    public Mono<RecursosDisponiblesDto.VehiculoItemDto> crearVehiculo(VehiculoCreateRequest request) {
        return webClient()
                .post()
                .uri("/recursos/vehiculos")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RecursosDisponiblesDto.VehiculoItemDto.class);
    }

    public Mono<RecursosDisponiblesDto.HerramientaItemDto> crearHerramienta(HerramientaCreateRequest request) {
        return webClient()
                .post()
                .uri("/recursos/herramientas")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RecursosDisponiblesDto.HerramientaItemDto.class);
    }

    public Mono<AsignacionDto> asignar(AsignarRecursoRequest request) {
        return webClient()
                .post()
                .uri("/recursos/asignar")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AsignacionDto.class);
    }

    public Mono<Void> desasignar(Long asignacionId) {
        return webClient()
                .delete()
                .uri("/recursos/asignar/{id}", asignacionId)
                .retrieve()
                .bodyToMono(Void.class);
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
