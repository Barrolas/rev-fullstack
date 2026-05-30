package cl.duocuc.rev.recursos.service;

import cl.duocuc.rev.recursos.dto.AsignacionResponse;
import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.HerramientaDto;
import cl.duocuc.rev.recursos.dto.RecursoAsignadoDto;
import cl.duocuc.rev.recursos.dto.RecursosDisponiblesResponse;
import cl.duocuc.rev.recursos.dto.VehiculoDto;
import cl.duocuc.rev.recursos.entity.Asignacion;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.Herramienta;
import cl.duocuc.rev.recursos.entity.Vehiculo;
import cl.duocuc.rev.recursos.exception.BusinessRuleException;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.AsignacionRepository;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import cl.duocuc.rev.recursos.repository.VehiculoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecursoService {

    private final BrigadaRepository brigadaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final HerramientaRepository herramientaRepository;
    private final AsignacionRepository asignacionRepository;

    public RecursosDisponiblesResponse listarDisponibles() {
        return RecursosDisponiblesResponse.builder()
                .brigadas(brigadaRepository.findByEstado(EstadoRecurso.DISPONIBLE).stream()
                        .map(this::toBrigadaDto)
                        .toList())
                .vehiculos(vehiculoRepository.findByEstado(EstadoRecurso.DISPONIBLE).stream()
                        .map(this::toVehiculoDto)
                        .toList())
                .herramientas(herramientaRepository.findByCantidadDisponibleGreaterThan(0).stream()
                        .map(this::toHerramientaDto)
                        .toList())
                .build();
    }

    public List<RecursoAsignadoDto> listarPorIncidente(UUID incidenteId) {
        return asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId).stream()
                .map(this::toRecursoAsignadoDto)
                .toList();
    }

    @Transactional
    public AsignacionResponse asignar(UUID incidenteId, Long brigadaId) {
        if (asignacionRepository.existsByIncidenteIdAndActivaTrue(incidenteId)) {
            throw new BusinessRuleException(
                    "ASIGNACION_DUPLICADA",
                    "El incidente ya tiene una asignación activa",
                    HttpStatus.CONFLICT);
        }
        Brigada brigada = brigadaRepository.findById(brigadaId)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADA_NO_ENCONTRADA", "Brigada no encontrada", HttpStatus.NOT_FOUND));
        if (brigada.getEstado() != EstadoRecurso.DISPONIBLE) {
            throw new BusinessRuleException(
                    "BRIGADA_NO_DISPONIBLE", "La brigada no está disponible", HttpStatus.CONFLICT);
        }
        brigada.setEstado(EstadoRecurso.ASIGNADO);
        brigadaRepository.save(brigada);
        Asignacion asignacion = Asignacion.builder()
                .incidenteId(incidenteId)
                .brigadaId(brigadaId)
                .activa(true)
                .createdAt(LocalDateTime.now())
                .build();
        return toAsignacionResponse(asignacionRepository.save(asignacion));
    }

    @Transactional
    public AsignacionResponse asignar(AsignarRequest request) {
        if (request.getIncidenteId() == null || request.getBrigadaId() == null) {
            throw new BusinessRuleException(
                    "DATOS_INVALIDOS",
                    "incidenteId y brigadaId son obligatorios",
                    HttpStatus.BAD_REQUEST);
        }
        AsignacionResponse response = asignar(request.getIncidenteId(), request.getBrigadaId());
        if (request.getVehiculoId() != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                    .orElseThrow(() -> new BusinessRuleException(
                            "VEHICULO_NO_ENCONTRADO", "Vehículo no encontrado", HttpStatus.NOT_FOUND));
            if (vehiculo.getEstado() != EstadoRecurso.DISPONIBLE) {
                throw new BusinessRuleException(
                        "VEHICULO_NO_DISPONIBLE", "El vehículo no está disponible", HttpStatus.CONFLICT);
            }
            vehiculo.setEstado(EstadoRecurso.ASIGNADO);
            vehiculoRepository.save(vehiculo);
            Asignacion asignacion = asignacionRepository.findById(response.getId())
                    .orElseThrow();
            asignacion.setVehiculoId(request.getVehiculoId());
            asignacionRepository.save(asignacion);
            response.setVehiculoId(request.getVehiculoId());
        }
        return response;
    }

    @Transactional
    public void desasignar(Long asignacionId) {
        Asignacion asignacion = asignacionRepository.findByIdAndActivaTrue(asignacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "ASIGNACION_NO_ENCONTRADA", "Asignación no encontrada o inactiva", HttpStatus.NOT_FOUND));
        asignacion.setActiva(false);
        asignacionRepository.save(asignacion);
        Brigada brigada = brigadaRepository.findById(asignacion.getBrigadaId())
                .orElseThrow();
        brigada.setEstado(EstadoRecurso.DISPONIBLE);
        brigadaRepository.save(brigada);
        if (asignacion.getVehiculoId() != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(asignacion.getVehiculoId())
                    .orElseThrow();
            vehiculo.setEstado(EstadoRecurso.DISPONIBLE);
            vehiculoRepository.save(vehiculo);
        }
    }

    private BrigadaDto toBrigadaDto(Brigada brigada) {
        return BrigadaDto.builder()
                .id(brigada.getId())
                .nombre(brigada.getNombre())
                .capacidad(brigada.getCapacidad())
                .estado(brigada.getEstado())
                .build();
    }

    private VehiculoDto toVehiculoDto(Vehiculo vehiculo) {
        return VehiculoDto.builder()
                .id(vehiculo.getId())
                .patente(vehiculo.getPatente())
                .tipo(vehiculo.getTipo())
                .estado(vehiculo.getEstado())
                .build();
    }

    private HerramientaDto toHerramientaDto(Herramienta herramienta) {
        return HerramientaDto.builder()
                .id(herramienta.getId())
                .nombre(herramienta.getNombre())
                .cantidadTotal(herramienta.getCantidadTotal())
                .cantidadDisponible(herramienta.getCantidadDisponible())
                .build();
    }

    private AsignacionResponse toAsignacionResponse(Asignacion asignacion) {
        return AsignacionResponse.builder()
                .id(asignacion.getId())
                .incidenteId(asignacion.getIncidenteId())
                .brigadaId(asignacion.getBrigadaId())
                .vehiculoId(asignacion.getVehiculoId())
                .activa(asignacion.getActiva())
                .createdAt(asignacion.getCreatedAt())
                .build();
    }

    private RecursoAsignadoDto toRecursoAsignadoDto(Asignacion asignacion) {
        Brigada brigada = brigadaRepository.findById(asignacion.getBrigadaId()).orElseThrow();
        return RecursoAsignadoDto.builder()
                .id(UUID.nameUUIDFromBytes(("asignacion-" + asignacion.getId()).getBytes()))
                .incidenteId(asignacion.getIncidenteId())
                .tipo("BRIGADA")
                .estado(brigada.getEstado().name())
                .descripcion(brigada.getNombre())
                .build();
    }
}
