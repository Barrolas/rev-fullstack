package cl.duocuc.rev.recursos.service;

import cl.duocuc.rev.recursos.dto.AsignacionResponse;
import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.recursos.dto.BrigadaDetalleDto;
import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.BrigadaHerramientaItemDto;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.dto.BrigadistaDto;
import cl.duocuc.rev.recursos.dto.BrigadistaRequest;
import cl.duocuc.rev.recursos.dto.HerramientaCantidadDto;
import cl.duocuc.rev.recursos.dto.HerramientaDto;
import cl.duocuc.rev.recursos.dto.HerramientaRequest;
import cl.duocuc.rev.recursos.dto.RecursoAsignadoDto;
import cl.duocuc.rev.recursos.dto.RecursosCatalogoResponse;
import cl.duocuc.rev.recursos.dto.RecursosDisponiblesResponse;
import cl.duocuc.rev.recursos.dto.VehiculoDto;
import cl.duocuc.rev.recursos.dto.VehiculoRequest;
import cl.duocuc.rev.recursos.entity.Asignacion;
import cl.duocuc.rev.recursos.entity.AsignacionBrigadista;
import cl.duocuc.rev.recursos.entity.AsignacionHerramienta;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.BrigadaBrigadista;
import cl.duocuc.rev.recursos.entity.BrigadaHerramienta;
import cl.duocuc.rev.recursos.entity.Brigadista;
import cl.duocuc.rev.recursos.entity.Herramienta;
import cl.duocuc.rev.recursos.entity.Vehiculo;
import cl.duocuc.rev.recursos.exception.BusinessRuleException;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.AsignacionBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionHerramientaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionRepository;
import cl.duocuc.rev.recursos.repository.BrigadaBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaHerramientaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import cl.duocuc.rev.recursos.repository.VehiculoRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final BrigadistaRepository brigadistaRepository;
    private final AsignacionRepository asignacionRepository;
    private final BrigadaBrigadistaRepository brigadaBrigadistaRepository;
    private final BrigadaHerramientaRepository brigadaHerramientaRepository;
    private final AsignacionBrigadistaRepository asignacionBrigadistaRepository;
    private final AsignacionHerramientaRepository asignacionHerramientaRepository;

    public RecursosCatalogoResponse listarCatalogo() {
        return RecursosCatalogoResponse.builder()
                .brigadas(brigadaRepository.findAll().stream().map(this::toBrigadaDto).toList())
                .vehiculos(vehiculoRepository.findAll().stream().map(this::toVehiculoDto).toList())
                .herramientas(herramientaRepository.findAll().stream().map(this::toHerramientaDto).toList())
                .brigadistas(brigadistaRepository.findAll().stream().map(this::toBrigadistaDto).toList())
                .build();
    }

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

    public BrigadaDetalleDto obtenerBrigadaDetalle(Long brigadaId) {
        Brigada brigada = brigadaRepository.findById(brigadaId)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADA_NO_ENCONTRADA", "Brigada no encontrada", HttpStatus.NOT_FOUND));
        return construirBrigadaDetalle(brigada);
    }

    @Transactional
    public BrigadaDetalleDto actualizarComposicion(Long brigadaId, BrigadaComposicionRequest request) {
        Brigada brigada = brigadaRepository.findById(brigadaId)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADA_NO_ENCONTRADA", "Brigada no encontrada", HttpStatus.NOT_FOUND));
        if (brigada.getEstado() == EstadoRecurso.ASIGNADO) {
            throw new BusinessRuleException(
                    "BRIGADA_EN_USO",
                    "No se puede editar la composición de una brigada en despacho",
                    HttpStatus.CONFLICT);
        }

        List<Long> brigadistaIds = request.getBrigadistaIds() != null ? request.getBrigadistaIds() : List.of();
        if (brigadistaIds.size() > brigada.getCapacidad()) {
            throw new BusinessRuleException(
                    "CAPACIDAD_EXCEDIDA",
                    "La brigada admite como máximo " + brigada.getCapacidad() + " brigadistas",
                    HttpStatus.BAD_REQUEST);
        }

        if (request.getVehiculoId() != null) {
            vehiculoRepository.findById(request.getVehiculoId())
                    .orElseThrow(() -> new BusinessRuleException(
                            "VEHICULO_NO_ENCONTRADO", "Vehículo no encontrado", HttpStatus.NOT_FOUND));
            brigada.setVehiculoId(request.getVehiculoId());
        } else {
            brigada.setVehiculoId(null);
        }
        brigadaRepository.save(brigada);

        brigadaBrigadistaRepository.deleteByBrigadaId(brigadaId);
        for (Long brigadistaId : brigadistaIds) {
            Brigadista brigadista = brigadistaRepository.findById(brigadistaId)
                    .orElseThrow(() -> new BusinessRuleException(
                            "BRIGADISTA_NO_ENCONTRADO", "Brigadista no encontrado", HttpStatus.NOT_FOUND));
            brigadaBrigadistaRepository.save(BrigadaBrigadista.builder()
                    .brigadaId(brigadaId)
                    .brigadistaId(brigadista.getId())
                    .build());
        }

        brigadaHerramientaRepository.deleteByBrigadaId(brigadaId);
        List<HerramientaCantidadDto> herramientas =
                request.getHerramientas() != null ? request.getHerramientas() : List.of();
        for (HerramientaCantidadDto item : herramientas) {
            if (item.getHerramientaId() == null || item.getCantidad() == null || item.getCantidad() <= 0) {
                continue;
            }
            herramientaRepository.findById(item.getHerramientaId())
                    .orElseThrow(() -> new BusinessRuleException(
                            "HERRAMIENTA_NO_ENCONTRADA", "Herramienta no encontrada", HttpStatus.NOT_FOUND));
            brigadaHerramientaRepository.save(BrigadaHerramienta.builder()
                    .brigadaId(brigadaId)
                    .herramientaId(item.getHerramientaId())
                    .cantidad(item.getCantidad())
                    .build());
        }

        return construirBrigadaDetalle(brigada);
    }

    public List<RecursoAsignadoDto> listarPorIncidente(UUID incidenteId) {
        List<RecursoAsignadoDto> resultado = new ArrayList<>();
        for (Asignacion asignacion : asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId)) {
            resultado.addAll(construirRecursosAsignados(asignacion));
        }
        return resultado;
    }

    @Transactional
    public AsignacionResponse asignar(AsignarRequest request) {
        if (request.getIncidenteId() == null || request.getBrigadaId() == null) {
            throw new BusinessRuleException(
                    "DATOS_INVALIDOS",
                    "incidenteId y brigadaId son obligatorios",
                    HttpStatus.BAD_REQUEST);
        }
        boolean usarComposicion =
                request.getUsarComposicionBrigada() == null || Boolean.TRUE.equals(request.getUsarComposicionBrigada());

        BrigadaDetalleDto detalle = obtenerBrigadaDetalle(request.getBrigadaId());
        if (usarComposicion && !detalle.isListaParaDespacho()) {
            throw new BusinessRuleException(
                    "BRIGADA_INCOMPLETA",
                    "La brigada no tiene composición completa o recursos no disponibles para despacho",
                    HttpStatus.CONFLICT);
        }

        Long vehiculoId = request.getVehiculoId() != null ? request.getVehiculoId() : detalle.getVehiculoId();

        AsignacionResponse response = asignarBase(request.getIncidenteId(), request.getBrigadaId(), vehiculoId);

        if (usarComposicion) {
            aplicarComposicionEnDespacho(response.getId(), detalle);
        }

        return response;
    }

    @Transactional
    public BrigadaDto crearBrigada(BrigadaRequest request) {
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new BusinessRuleException(
                    "NOMBRE_REQUERIDO", "El nombre de la brigada es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (request.getCapacidad() == null || request.getCapacidad() <= 0) {
            throw new BusinessRuleException(
                    "CAPACIDAD_INVALIDA", "La capacidad debe ser mayor a cero", HttpStatus.BAD_REQUEST);
        }
        Brigada brigada = Brigada.builder()
                .nombre(request.getNombre().trim())
                .capacidad(request.getCapacidad())
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        return toBrigadaDto(brigadaRepository.save(brigada));
    }

    @Transactional
    public BrigadistaDto crearBrigadista(BrigadistaRequest request) {
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new BusinessRuleException(
                    "NOMBRE_REQUERIDO", "El nombre del brigadista es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (request.getApellido() == null || request.getApellido().isBlank()) {
            throw new BusinessRuleException(
                    "APELLIDO_REQUERIDO", "El apellido del brigadista es obligatorio", HttpStatus.BAD_REQUEST);
        }
        Brigadista brigadista = Brigadista.builder()
                .nombre(request.getNombre().trim())
                .apellido(request.getApellido().trim())
                .rut(request.getRut() != null ? request.getRut().trim() : null)
                .especialidad(request.getEspecialidad() != null ? request.getEspecialidad().trim() : null)
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        return toBrigadistaDto(brigadistaRepository.save(brigadista));
    }

    @Transactional
    public VehiculoDto crearVehiculo(VehiculoRequest request) {
        if (request.getPatente() == null || request.getPatente().isBlank()) {
            throw new BusinessRuleException(
                    "PATENTE_REQUERIDA", "La patente es obligatoria", HttpStatus.BAD_REQUEST);
        }
        if (request.getTipo() == null || request.getTipo().isBlank()) {
            throw new BusinessRuleException(
                    "TIPO_REQUERIDO", "El tipo de vehiculo es obligatorio", HttpStatus.BAD_REQUEST);
        }
        Vehiculo vehiculo = Vehiculo.builder()
                .patente(request.getPatente().trim().toUpperCase())
                .tipo(request.getTipo().trim().toUpperCase())
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        return toVehiculoDto(vehiculoRepository.save(vehiculo));
    }

    @Transactional
    public HerramientaDto crearHerramienta(HerramientaRequest request) {
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new BusinessRuleException(
                    "NOMBRE_REQUERIDO", "El nombre de la herramienta es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (request.getCantidadTotal() == null || request.getCantidadTotal() <= 0) {
            throw new BusinessRuleException(
                    "CANTIDAD_INVALIDA", "La cantidad total debe ser mayor a cero", HttpStatus.BAD_REQUEST);
        }
        Herramienta herramienta = Herramienta.builder()
                .nombre(request.getNombre().trim())
                .cantidadTotal(request.getCantidadTotal())
                .cantidadDisponible(request.getCantidadTotal())
                .build();
        return toHerramientaDto(herramientaRepository.save(herramienta));
    }

    @Transactional
    public void desasignar(Long asignacionId) {
        Asignacion asignacion = asignacionRepository.findByIdAndActivaTrue(asignacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "ASIGNACION_NO_ENCONTRADA", "Asignación no encontrada o inactiva", HttpStatus.NOT_FOUND));
        asignacion.setActiva(false);
        asignacionRepository.save(asignacion);

        Brigada brigada = brigadaRepository.findById(asignacion.getBrigadaId()).orElseThrow();
        brigada.setEstado(EstadoRecurso.DISPONIBLE);
        brigadaRepository.save(brigada);

        if (asignacion.getVehiculoId() != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(asignacion.getVehiculoId()).orElseThrow();
            vehiculo.setEstado(EstadoRecurso.DISPONIBLE);
            vehiculoRepository.save(vehiculo);
        }

        for (AsignacionBrigadista ab : asignacionBrigadistaRepository.findByAsignacionId(asignacionId)) {
            Brigadista brigadista = brigadistaRepository.findById(ab.getBrigadistaId()).orElseThrow();
            brigadista.setEstado(EstadoRecurso.DISPONIBLE);
            brigadistaRepository.save(brigadista);
        }
        asignacionBrigadistaRepository.deleteByAsignacionId(asignacionId);

        for (AsignacionHerramienta ah : asignacionHerramientaRepository.findByAsignacionId(asignacionId)) {
            Herramienta herramienta = herramientaRepository.findById(ah.getHerramientaId()).orElseThrow();
            herramienta.setCantidadDisponible(herramienta.getCantidadDisponible() + ah.getCantidad());
            herramientaRepository.save(herramienta);
        }
        asignacionHerramientaRepository.deleteByAsignacionId(asignacionId);
    }

    private AsignacionResponse asignarBase(UUID incidenteId, Long brigadaId, Long vehiculoId) {
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
        asignacion = asignacionRepository.save(asignacion);

        if (vehiculoId != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                    .orElseThrow(() -> new BusinessRuleException(
                            "VEHICULO_NO_ENCONTRADO", "Vehículo no encontrado", HttpStatus.NOT_FOUND));
            if (vehiculo.getEstado() != EstadoRecurso.DISPONIBLE) {
                throw new BusinessRuleException(
                        "VEHICULO_NO_DISPONIBLE", "El vehículo no está disponible", HttpStatus.CONFLICT);
            }
            vehiculo.setEstado(EstadoRecurso.ASIGNADO);
            vehiculoRepository.save(vehiculo);
            asignacion.setVehiculoId(vehiculoId);
            asignacionRepository.save(asignacion);
        }

        return toAsignacionResponse(asignacion);
    }

    private void aplicarComposicionEnDespacho(Long asignacionId, BrigadaDetalleDto detalle) {
        for (BrigadistaDto brigadista : detalle.getBrigadistas()) {
            if (brigadista.getEstado() != EstadoRecurso.DISPONIBLE) {
                throw new BusinessRuleException(
                        "BRIGADISTA_NO_DISPONIBLE",
                        "Brigadista no disponible: " + brigadista.getNombre() + " " + brigadista.getApellido(),
                        HttpStatus.CONFLICT);
            }
            Brigadista entity = brigadistaRepository.findById(brigadista.getId()).orElseThrow();
            entity.setEstado(EstadoRecurso.ASIGNADO);
            brigadistaRepository.save(entity);
            asignacionBrigadistaRepository.save(AsignacionBrigadista.builder()
                    .asignacionId(asignacionId)
                    .brigadistaId(brigadista.getId())
                    .build());
        }

        for (BrigadaHerramientaItemDto item : detalle.getHerramientas()) {
            Herramienta herramienta = herramientaRepository.findById(item.getHerramientaId()).orElseThrow();
            if (herramienta.getCantidadDisponible() < item.getCantidad()) {
                throw new BusinessRuleException(
                        "STOCK_INSUFICIENTE",
                        "Stock insuficiente de " + item.getNombre(),
                        HttpStatus.CONFLICT);
            }
            herramienta.setCantidadDisponible(herramienta.getCantidadDisponible() - item.getCantidad());
            herramientaRepository.save(herramienta);
            asignacionHerramientaRepository.save(AsignacionHerramienta.builder()
                    .asignacionId(asignacionId)
                    .herramientaId(item.getHerramientaId())
                    .cantidad(item.getCantidad())
                    .build());
        }
    }

    private BrigadaDetalleDto construirBrigadaDetalle(Brigada brigada) {
        VehiculoDto vehiculoDto = null;
        boolean vehiculoOk = true;
        if (brigada.getVehiculoId() != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(brigada.getVehiculoId()).orElse(null);
            if (vehiculo != null) {
                vehiculoDto = toVehiculoDto(vehiculo);
                vehiculoOk = vehiculo.getEstado() == EstadoRecurso.DISPONIBLE;
            } else {
                vehiculoOk = false;
            }
        } else {
            vehiculoOk = false;
        }

        List<BrigadistaDto> brigadistas = brigadaBrigadistaRepository.findByBrigadaId(brigada.getId()).stream()
                .map(bb -> brigadistaRepository.findById(bb.getBrigadistaId()).orElseThrow())
                .map(this::toBrigadistaDto)
                .toList();

        boolean brigadistasOk = !brigadistas.isEmpty()
                && brigadistas.size() <= brigada.getCapacidad()
                && brigadistas.stream().allMatch(b -> b.getEstado() == EstadoRecurso.DISPONIBLE);

        List<BrigadaHerramientaItemDto> herramientas =
                brigadaHerramientaRepository.findByBrigadaId(brigada.getId()).stream()
                        .map(bh -> {
                            Herramienta h = herramientaRepository.findById(bh.getHerramientaId()).orElseThrow();
                            return BrigadaHerramientaItemDto.builder()
                                    .herramientaId(h.getId())
                                    .nombre(h.getNombre())
                                    .cantidad(bh.getCantidad())
                                    .build();
                        })
                        .toList();

        boolean herramientasOk = !herramientas.isEmpty()
                && herramientas.stream().allMatch(item -> {
                    Herramienta h = herramientaRepository.findById(item.getHerramientaId()).orElseThrow();
                    return h.getCantidadDisponible() >= item.getCantidad();
                });

        boolean listaParaDespacho = brigada.getEstado() == EstadoRecurso.DISPONIBLE
                && vehiculoOk
                && brigadistasOk
                && herramientasOk;

        return BrigadaDetalleDto.builder()
                .id(brigada.getId())
                .nombre(brigada.getNombre())
                .capacidad(brigada.getCapacidad())
                .estado(brigada.getEstado())
                .vehiculoId(brigada.getVehiculoId())
                .vehiculo(vehiculoDto)
                .brigadistas(brigadistas)
                .herramientas(herramientas)
                .listaParaDespacho(listaParaDespacho)
                .build();
    }

    private List<RecursoAsignadoDto> construirRecursosAsignados(Asignacion asignacion) {
        List<RecursoAsignadoDto> items = new ArrayList<>();
        Brigada brigada = brigadaRepository.findById(asignacion.getBrigadaId()).orElseThrow();
        items.add(RecursoAsignadoDto.builder()
                .id(UUID.nameUUIDFromBytes(("brigada-" + asignacion.getId()).getBytes()))
                .incidenteId(asignacion.getIncidenteId())
                .tipo("BRIGADA")
                .estado(brigada.getEstado().name())
                .descripcion(brigada.getNombre())
                .build());

        if (asignacion.getVehiculoId() != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(asignacion.getVehiculoId()).orElseThrow();
            items.add(RecursoAsignadoDto.builder()
                    .id(UUID.nameUUIDFromBytes(("vehiculo-" + asignacion.getId()).getBytes()))
                    .incidenteId(asignacion.getIncidenteId())
                    .tipo("VEHICULO")
                    .estado(vehiculo.getEstado().name())
                    .descripcion(vehiculo.getPatente() + " — " + vehiculo.getTipo())
                    .build());
        }

        for (AsignacionBrigadista ab : asignacionBrigadistaRepository.findByAsignacionId(asignacion.getId())) {
            Brigadista brigadista = brigadistaRepository.findById(ab.getBrigadistaId()).orElseThrow();
            items.add(RecursoAsignadoDto.builder()
                    .id(UUID.nameUUIDFromBytes(
                            ("brigadista-" + asignacion.getId() + "-" + brigadista.getId()).getBytes()))
                    .incidenteId(asignacion.getIncidenteId())
                    .tipo("BRIGADISTA")
                    .estado(brigadista.getEstado().name())
                    .descripcion(brigadista.getNombre() + " " + brigadista.getApellido())
                    .build());
        }

        for (AsignacionHerramienta ah : asignacionHerramientaRepository.findByAsignacionId(asignacion.getId())) {
            Herramienta herramienta = herramientaRepository.findById(ah.getHerramientaId()).orElseThrow();
            items.add(RecursoAsignadoDto.builder()
                    .id(UUID.nameUUIDFromBytes(
                            ("herramienta-" + asignacion.getId() + "-" + herramienta.getId()).getBytes()))
                    .incidenteId(asignacion.getIncidenteId())
                    .tipo("HERRAMIENTA")
                    .estado("ASIGNADO")
                    .descripcion(herramienta.getNombre() + " x" + ah.getCantidad())
                    .build());
        }

        return items;
    }

    private BrigadaDto toBrigadaDto(Brigada brigada) {
        return BrigadaDto.builder()
                .id(brigada.getId())
                .nombre(brigada.getNombre())
                .capacidad(brigada.getCapacidad())
                .estado(brigada.getEstado())
                .vehiculoId(brigada.getVehiculoId())
                .build();
    }

    private BrigadistaDto toBrigadistaDto(Brigadista brigadista) {
        return BrigadistaDto.builder()
                .id(brigadista.getId())
                .nombre(brigadista.getNombre())
                .apellido(brigadista.getApellido())
                .rut(brigadista.getRut())
                .especialidad(brigadista.getEspecialidad())
                .estado(brigadista.getEstado())
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
}
