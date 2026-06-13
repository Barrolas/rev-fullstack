package cl.duocuc.rev.bff.client;

import cl.duocuc.rev.bff.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.bff.dto.AsignacionActivaDto;
import cl.duocuc.rev.bff.dto.AsignacionDto;
import cl.duocuc.rev.bff.dto.AsignarRecursoRequest;
import cl.duocuc.rev.bff.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.bff.dto.BrigadaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadaDetalleDto;
import cl.duocuc.rev.bff.dto.BrigadaElegibilidadDto;
import cl.duocuc.rev.bff.dto.BrigadaVehiculoDto;
import cl.duocuc.rev.bff.dto.BrigadaVehiculosRequest;
import cl.duocuc.rev.bff.dto.BrigadistaCreateRequest;
import cl.duocuc.rev.bff.dto.BrigadistaRolDto;
import cl.duocuc.rev.bff.dto.ComunaDto;
import cl.duocuc.rev.bff.dto.CompaniaDto;
import cl.duocuc.rev.bff.dto.HerramientaCreateRequest;
import cl.duocuc.rev.bff.dto.InstitucionDto;
import cl.duocuc.rev.bff.dto.RecursosCatalogoDto;
import cl.duocuc.rev.bff.dto.RecursosDisponiblesDto;
import cl.duocuc.rev.bff.dto.RecursoDto;
import cl.duocuc.rev.bff.dto.TransferirIncidenteRequest;
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

    public Mono<List<AsignacionActivaDto>> listarAsignacionesPorIncidente(UUID incidenteId) {
        return webClient()
                .get()
                .uri("/recursos/incidente/{incidenteId}/asignaciones-activas", incidenteId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<List<InstitucionDto>> listarInstituciones() {
        return webClient()
                .get()
                .uri("/recursos/instituciones")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<List<CompaniaDto>> listarCompanias() {
        return webClient()
                .get()
                .uri("/recursos/companias")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<List<ComunaDto>> listarComunas() {
        return webClient()
                .get()
                .uri("/recursos/comunas")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<List<BrigadistaRolDto>> listarBrigadistaRoles() {
        return webClient()
                .get()
                .uri("/recursos/brigadista-roles")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<BrigadaElegibilidadDto> elegibilidadDespacho(Long brigadaId) {
        return webClient()
                .get()
                .uri("/recursos/brigadas/{id}/elegibilidad-despacho", brigadaId)
                .retrieve()
                .bodyToMono(BrigadaElegibilidadDto.class);
    }

    public Mono<List<BrigadaVehiculoDto>> actualizarVehiculosBrigada(Long id, BrigadaVehiculosRequest request) {
        return webClient()
                .put()
                .uri("/recursos/brigadas/{id}/vehiculos", id)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<List<AsignacionActivaDto>> listarAsignacionesActivas() {
        return webClient()
                .get()
                .uri("/recursos/asignaciones/activas")
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

    public Mono<List<AsignacionActivaDto>> transferirIncidente(TransferirIncidenteRequest request) {
        return webClient()
                .post()
                .uri("/recursos/asignar/transferir-incidente")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<Void> desasignar(Long asignacionId) {
        return webClient()
                .delete()
                .uri("/recursos/asignar/{id}", asignacionId)
                .retrieve()
                .bodyToMono(Void.class);
    }

    public Mono<AsignacionActivaDto> actualizarEstadoDespacho(Long asignacionId, ActualizarEstadoDespachoRequest request) {
        return webClient()
                .put()
                .uri("/recursos/asignar/{id}/estado-despacho", asignacionId)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AsignacionActivaDto.class);
    }

    public Mono<Void> liberarPorIncidente(UUID incidenteId) {
        return webClient()
                .delete()
                .uri("/recursos/incidente/{incidenteId}/asignaciones", incidenteId)
                .retrieve()
                .bodyToMono(Void.class);
    }

    public Mono<RecursosCatalogoDto.BrigadistaItemDto> obtenerBrigadistaPorSub(UUID sub) {
        return webClient()
                .get()
                .uri("/recursos/brigadistas/por-keycloak/{sub}", sub)
                .retrieve()
                .bodyToMono(RecursosCatalogoDto.BrigadistaItemDto.class);
    }

    public Mono<RecursosCatalogoDto.BrigadistaItemDto> obtenerBrigadistaPorUsername(String username) {
        return webClient()
                .get()
                .uri("/recursos/brigadistas/por-username/{username}", username)
                .retrieve()
                .bodyToMono(RecursosCatalogoDto.BrigadistaItemDto.class);
    }

    public Mono<List<AsignacionActivaDto>> listarAsignacionesPorBrigada(Long brigadaId) {
        return webClient()
                .get()
                .uri("/recursos/brigadas/{id}/asignaciones-activas", brigadaId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<List<UUID>> listarIncidenteIdsPorBrigada(Long brigadaId) {
        return webClient()
                .get()
                .uri("/recursos/brigadas/{id}/incidentes-activos", brigadaId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<>() {
                });
    }

    public Mono<AsignacionActivaDto> obtenerAsignacionActiva(Long asignacionId) {
        return webClient()
                .get()
                .uri("/recursos/asignaciones/{id}", asignacionId)
                .retrieve()
                .bodyToMono(AsignacionActivaDto.class);
    }

    public boolean brigadaAsignadaAIncidente(Long brigadaId, UUID incidenteId) {
        List<UUID> ids = listarIncidenteIdsPorBrigada(brigadaId).block();
        return ids != null && ids.contains(incidenteId);
    }

    public RecursosDisponiblesDto.BrigadaItemDto obtenerBrigadaResumen(Long brigadaId) {
        RecursosCatalogoDto catalogo = listarCatalogo().block();
        if (catalogo == null || catalogo.getBrigadas() == null) {
            return null;
        }
        return catalogo.getBrigadas().stream()
                .filter(b -> brigadaId.equals(b.getId()))
                .findFirst()
                .map(b -> RecursosDisponiblesDto.BrigadaItemDto.builder()
                        .id(b.getId())
                        .nombre(b.getNombre())
                        .codigo(b.getCodigo())
                        .capacidad(b.getCapacidad())
                        .estado(b.getEstado())
                        .build())
                .orElse(null);
    }

    private WebClient webClient() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }
}
