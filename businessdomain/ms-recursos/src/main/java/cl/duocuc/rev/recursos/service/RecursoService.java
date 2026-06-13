package cl.duocuc.rev.recursos.service;

import cl.duocuc.rev.recursos.dto.ActualizarEstadoDespachoRequest;
import cl.duocuc.rev.recursos.dto.AsignacionActivaDto;
import cl.duocuc.rev.recursos.dto.AsignacionResponse;
import cl.duocuc.rev.recursos.dto.AsignarRequest;
import cl.duocuc.rev.recursos.dto.BrigadaComposicionRequest;
import cl.duocuc.rev.recursos.dto.BrigadaDetalleDto;
import cl.duocuc.rev.recursos.dto.BrigadaDto;
import cl.duocuc.rev.recursos.dto.BrigadaElegibilidadDto;
import cl.duocuc.rev.recursos.dto.BrigadaHerramientaItemDto;
import cl.duocuc.rev.recursos.dto.BrigadaRequest;
import cl.duocuc.rev.recursos.dto.BrigadaVehiculoDto;
import cl.duocuc.rev.recursos.dto.BrigadaVehiculosRequest;
import cl.duocuc.rev.recursos.dto.BrigadistaDto;
import cl.duocuc.rev.recursos.dto.BrigadistaRequest;
import cl.duocuc.rev.recursos.dto.BrigadistaRolDto;
import cl.duocuc.rev.recursos.dto.ComunaDto;
import cl.duocuc.rev.recursos.dto.CompaniaDto;
import cl.duocuc.rev.recursos.dto.HerramientaCantidadDto;
import cl.duocuc.rev.recursos.dto.HerramientaDto;
import cl.duocuc.rev.recursos.dto.HerramientaRequest;
import cl.duocuc.rev.recursos.dto.InstitucionDto;
import cl.duocuc.rev.recursos.dto.RecursoAsignadoDto;
import cl.duocuc.rev.recursos.dto.RecursosCatalogoResponse;
import cl.duocuc.rev.recursos.dto.RecursosDisponiblesResponse;
import cl.duocuc.rev.recursos.dto.TransferirIncidenteRequest;
import cl.duocuc.rev.recursos.dto.VehiculoDto;
import cl.duocuc.rev.recursos.dto.VehiculoRequest;
import cl.duocuc.rev.recursos.entity.Asignacion;
import cl.duocuc.rev.recursos.entity.AsignacionBrigadista;
import cl.duocuc.rev.recursos.entity.AsignacionHerramienta;
import cl.duocuc.rev.recursos.entity.Brigada;
import cl.duocuc.rev.recursos.entity.BrigadaBrigadista;
import cl.duocuc.rev.recursos.entity.BrigadaHerramienta;
import cl.duocuc.rev.recursos.entity.BrigadaVehiculo;
import cl.duocuc.rev.recursos.entity.Brigadista;
import cl.duocuc.rev.recursos.entity.BrigadistaRol;
import cl.duocuc.rev.recursos.entity.Comuna;
import cl.duocuc.rev.recursos.entity.Compania;
import cl.duocuc.rev.recursos.entity.Herramienta;
import cl.duocuc.rev.recursos.entity.Institucion;
import cl.duocuc.rev.recursos.entity.Vehiculo;
import cl.duocuc.rev.recursos.exception.BusinessRuleException;
import cl.duocuc.rev.recursos.model.EstadoRecurso;
import cl.duocuc.rev.recursos.repository.AsignacionBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionHerramientaRepository;
import cl.duocuc.rev.recursos.repository.AsignacionRepository;
import cl.duocuc.rev.recursos.repository.BrigadaBrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaHerramientaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaRepository;
import cl.duocuc.rev.recursos.repository.BrigadaVehiculoRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRepository;
import cl.duocuc.rev.recursos.repository.BrigadistaRolRepository;
import cl.duocuc.rev.recursos.repository.ComunaRepository;
import cl.duocuc.rev.recursos.repository.CompaniaRepository;
import cl.duocuc.rev.recursos.repository.HerramientaRepository;
import cl.duocuc.rev.recursos.repository.InstitucionRepository;
import cl.duocuc.rev.recursos.repository.VehiculoRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private final BrigadaHerramientaRepository brigadaHerramientaRepository;
    private final AsignacionBrigadistaRepository asignacionBrigadistaRepository;
    private final AsignacionHerramientaRepository asignacionHerramientaRepository;
    private final InstitucionRepository institucionRepository;
    private final CompaniaRepository companiaRepository;
    private final ComunaRepository comunaRepository;
    private final BrigadistaRolRepository brigadistaRolRepository;
    private final BrigadaVehiculoRepository brigadaVehiculoRepository;
    private final BrigadaBrigadistaRepository brigadaBrigadistaRepository;

    public List<InstitucionDto> listarInstituciones() {
        return institucionRepository.findAll().stream().map(this::toInstitucionDto).toList();
    }

    public List<CompaniaDto> listarCompanias() {
        return companiaRepository.findAll().stream().map(this::toCompaniaDto).toList();
    }

    public List<ComunaDto> listarComunas() {
        return comunaRepository.findAll().stream().map(this::toComunaDto).toList();
    }

    public List<BrigadistaRolDto> listarBrigadistaRoles() {
        return brigadistaRolRepository.findAll().stream()
                .map(this::toBrigadistaRolDto)
                .toList();
    }

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

    public BrigadaElegibilidadDto evaluarElegibilidadDespacho(Long brigadaId) {
        BrigadaDetalleDto detalle = obtenerBrigadaDetalle(brigadaId);
        List<String> motivos = new ArrayList<>();
        if (detalle.getIdJefeBrigadista() == null) {
            motivos.add("Falta jefe de brigada");
        }
        if (detalle.getBrigadistas() == null || detalle.getBrigadistas().isEmpty()) {
            motivos.add("Sin integrantes asignados");
        } else {
            if (detalle.getBrigadistas().size() > detalle.getCapacidad()) {
                motivos.add("Integrantes exceden capacidad de la brigada");
            }
            long noDisponibles = detalle.getBrigadistas().stream()
                    .filter(b -> b.getEstado() != EstadoRecurso.DISPONIBLE)
                    .count();
            if (noDisponibles > 0) {
                motivos.add(noDisponibles + " integrante(s) no disponible(s) (en otro despacho)");
            }
        }
        if (detalle.getVehiculos() == null || detalle.getVehiculos().isEmpty()) {
            motivos.add("Sin vehículo activo en dotación");
        }
        if (detalle.getEstado() != EstadoRecurso.DISPONIBLE) {
            motivos.add("Brigada no disponible");
        }
        if (detalle.getHerramientas() != null) {
            for (BrigadaHerramientaItemDto item : detalle.getHerramientas()) {
                Herramienta h = herramientaRepository.findById(item.getHerramientaId()).orElse(null);
                if (h == null || h.getCantidadDisponible() < item.getCantidad()) {
                    motivos.add("Stock insuficiente de " + item.getNombre());
                    break;
                }
            }
        }
        if (!detalle.isListaParaDespacho() && motivos.isEmpty()) {
            motivos.add("Composición de despacho incompleta");
        }
        Integer capPasajeros = detalle.getVehiculo() != null ? detalle.getVehiculo().getCapacidadPasajeros() : null;
        return BrigadaElegibilidadDto.builder()
                .brigadaId(brigadaId)
                .listaParaDespacho(detalle.isListaParaDespacho())
                .motivos(motivos)
                .integrantes(detalle.getBrigadistas() != null ? detalle.getBrigadistas().size() : 0)
                .capacidadBrigada(detalle.getCapacidad())
                .capacidadPasajerosVehiculoPrincipal(capPasajeros)
                .build();
    }

    public List<BrigadaVehiculoDto> listarVehiculosBrigada(Long brigadaId) {
        validarBrigadaExiste(brigadaId);
        return brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigadaId).stream()
                .map(this::toBrigadaVehiculoDto)
                .toList();
    }

    @Transactional
    public List<BrigadaVehiculoDto> actualizarVehiculosBrigada(Long brigadaId, BrigadaVehiculosRequest request) {
        Brigada brigada = validarBrigadaEditable(brigadaId);
        List<Long> vehiculoIds = request.getVehiculoIds() != null ? request.getVehiculoIds() : List.of();
        if (vehiculoIds.isEmpty()) {
            throw new BusinessRuleException(
                    "VEHICULOS_REQUERIDOS", "Debe indicar al menos un vehículo", HttpStatus.BAD_REQUEST);
        }
        Long principalId = request.getPrincipalVehiculoId() != null
                ? request.getPrincipalVehiculoId()
                : vehiculoIds.getFirst();
        if (!vehiculoIds.contains(principalId)) {
            throw new BusinessRuleException(
                    "PRINCIPAL_INVALIDO",
                    "El vehículo principal debe estar en la lista",
                    HttpStatus.BAD_REQUEST);
        }
        aplicarDotacionVehiculos(brigada.getId(), vehiculoIds, principalId);
        return listarVehiculosBrigada(brigadaId);
    }

    @Transactional
    public BrigadaDetalleDto actualizarComposicion(Long brigadaId, BrigadaComposicionRequest request) {
        Brigada brigada = validarBrigadaEditable(brigadaId);

        List<Long> brigadistaIds = request.getBrigadistaIds() != null ? request.getBrigadistaIds() : List.of();
        if (brigadistaIds.size() > brigada.getCapacidad()) {
            throw new BusinessRuleException(
                    "CAPACIDAD_EXCEDIDA",
                    "La brigada admite como máximo " + brigada.getCapacidad() + " brigadistas",
                    HttpStatus.BAD_REQUEST);
        }

        Long jefeId = request.getJefeBrigadistaId();
        if (jefeId != null && !brigadistaIds.contains(jefeId)) {
            brigadistaIds = new ArrayList<>(brigadistaIds);
            brigadistaIds.add(jefeId);
        }

        desvincularBrigadistasDeBrigada(brigadaId);
        BrigadistaRol rolJefe = brigadistaRolRepository.findByCodigo("JEFE").orElseThrow();
        BrigadistaRol rolCombatiente = brigadistaRolRepository.findByCodigo("COMBATIENTE").orElseThrow();

        for (Long brigadistaId : new HashSet<>(brigadistaIds)) {
            Brigadista brigadista = brigadistaRepository.findById(brigadistaId)
                    .orElseThrow(() -> new BusinessRuleException(
                            "BRIGADISTA_NO_ENCONTRADO", "Brigadista no encontrado", HttpStatus.NOT_FOUND));
            boolean esJefe = jefeId != null && jefeId.equals(brigadistaId);
            Long rolId = esJefe ? rolJefe.getId() : rolCombatiente.getId();
            brigadista.setIdBrigada(brigadaId);
            brigadista.setIdRolBrigadista(rolId);
            brigadistaRepository.save(brigadista);
            vincularBrigadistaABrigada(brigadaId, brigadistaId, rolId, esJefe);
        }
        brigada.setIdJefeBrigadista(jefeId);
        brigadaRepository.save(brigada);

        if (request.getVehiculoIds() != null && !request.getVehiculoIds().isEmpty()) {
            Long principal = request.getPrincipalVehiculoId() != null
                    ? request.getPrincipalVehiculoId()
                    : request.getVehiculoId() != null ? request.getVehiculoId() : request.getVehiculoIds().getFirst();
            aplicarDotacionVehiculos(brigadaId, request.getVehiculoIds(), principal);
        } else if (request.getVehiculoId() != null) {
            aplicarDotacionVehiculos(brigadaId, List.of(request.getVehiculoId()), request.getVehiculoId());
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

    public List<AsignacionActivaDto> listarAsignacionesActivas() {
        return asignacionRepository.findByActivaTrueOrderByCreatedAtDesc().stream()
                .map(this::toAsignacionActivaDto)
                .toList();
    }

    public List<AsignacionActivaDto> listarAsignacionesPorIncidente(UUID incidenteId) {
        return asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId).stream()
                .map(this::toAsignacionActivaDto)
                .toList();
    }

    @Transactional
    public List<AsignacionActivaDto> transferirIncidente(TransferirIncidenteRequest request) {
        if (request.getAsignacionIds() == null || request.getAsignacionIds().isEmpty()) {
            throw new BusinessRuleException(
                    "VALIDATION", "asignacionIds es obligatorio", HttpStatus.BAD_REQUEST);
        }
        if (request.getNuevoIncidenteId() == null) {
            throw new BusinessRuleException(
                    "VALIDATION", "nuevoIncidenteId es obligatorio", HttpStatus.BAD_REQUEST);
        }
        LocalDateTime now = LocalDateTime.now();
        List<AsignacionActivaDto> resultado = new ArrayList<>();
        for (Long asignacionId : request.getAsignacionIds()) {
            Asignacion asignacion = asignacionRepository
                    .findById(asignacionId)
                    .orElseThrow(() -> new BusinessRuleException(
                            "NOT_FOUND", "Asignacion no encontrada: " + asignacionId, HttpStatus.NOT_FOUND));
            if (!Boolean.TRUE.equals(asignacion.getActiva())) {
                throw new BusinessRuleException(
                        "ASIGNACION_INACTIVA",
                        "La asignacion " + asignacionId + " ya no esta activa",
                        HttpStatus.CONFLICT);
            }
            asignacion.setIncidenteId(request.getNuevoIncidenteId());
            asignacion.setFActualizacion(now);
            resultado.add(toAsignacionActivaDto(asignacionRepository.save(asignacion)));
        }
        return resultado;
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
        boolean composicionExplicita = tieneComposicionExplicita(request);

        if (usarComposicion && !composicionExplicita && !detalle.isListaParaDespacho()) {
            throw new BusinessRuleException(
                    "BRIGADA_INCOMPLETA",
                    "La brigada no cumple requisitos de despacho (jefe, integrantes, vehículo, herramientas)",
                    HttpStatus.CONFLICT);
        }

        List<BrigadistaDto> integrantesDespacho = resolverIntegrantesDespacho(detalle, request);
        List<BrigadaHerramientaItemDto> kitDespacho = resolverKitDespacho(detalle, request);

        if (usarComposicion) {
            validarComposicionDespacho(detalle, integrantesDespacho, kitDespacho);
        }

        Long vehiculoId = resolverVehiculoPrincipalDespacho(detalle, request);
        if (usarComposicion && vehiculoId == null) {
            throw new BusinessRuleException(
                    "VEHICULO_REQUERIDO", "Debe indicar vehículo para el despacho", HttpStatus.BAD_REQUEST);
        }

        if (usarComposicion) {
            int integrantes = integrantesDespacho.size();
            int plazasTotales = sumCapacidadPasajerosVehiculosDespacho(detalle, request);
            if (plazasTotales > 0 && integrantes > plazasTotales) {
                throw new BusinessRuleException(
                        "CAPACIDAD_PASAJEROS_EXCEDIDA",
                        "Integrantes (" + integrantes + ") superan plazas de los vehículos del despacho ("
                                + plazasTotales + ")",
                        HttpStatus.BAD_REQUEST);
            }
        }

        AsignacionResponse response = asignarBase(
                request.getIncidenteId(), request.getBrigadaId(), vehiculoId, request.getDespachadoPor());

        if (usarComposicion) {
            aplicarComposicionEnDespacho(response.getId(), integrantesDespacho, kitDespacho);
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
                .codigo(request.getCodigo() != null && !request.getCodigo().isBlank()
                        ? request.getCodigo().trim().toUpperCase()
                        : null)
                .idCompania(request.getIdCompania())
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
        Long rolId = request.getIdRolBrigadista();
        if (rolId == null) {
            rolId = brigadistaRolRepository.findByCodigo("COMBATIENTE")
                    .map(BrigadistaRol::getId)
                    .orElse(null);
        }
        Brigadista brigadista = Brigadista.builder()
                .nombre(request.getNombre().trim())
                .apellido(request.getApellido().trim())
                .rut(request.getRut() != null ? request.getRut().trim() : null)
                .especialidad(request.getEspecialidad() != null ? request.getEspecialidad().trim() : null)
                .idRolBrigadista(rolId)
                .keycloakSub(request.getKeycloakSub())
                .keycloakUsername(trimOrNull(request.getKeycloakUsername()))
                .email(trimOrNull(request.getEmail()))
                .estado(EstadoRecurso.DISPONIBLE)
                .build();
        return toBrigadistaDto(brigadistaRepository.save(brigadista));
    }

    public BrigadistaDto obtenerBrigadistaPorKeycloakSub(UUID keycloakSub) {
        Brigadista brigadista = brigadistaRepository.findByKeycloakSub(keycloakSub)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADISTA_NO_VINCULADO",
                        "No hay brigadista operativo vinculado a esta cuenta",
                        HttpStatus.NOT_FOUND));
        return toBrigadistaDto(brigadista);
    }

    public BrigadistaDto obtenerBrigadistaPorUsername(String username) {
        Brigadista brigadista = brigadistaRepository.findByKeycloakUsername(username)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADISTA_NO_VINCULADO",
                        "No hay brigadista operativo vinculado a esta cuenta",
                        HttpStatus.NOT_FOUND));
        return toBrigadistaDto(brigadista);
    }

    @Transactional
    public BrigadistaDto vincularKeycloakSub(Long brigadistaId, UUID keycloakSub, String keycloakUsername, String email) {
        Brigadista brigadista = brigadistaRepository.findById(brigadistaId)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADISTA_NO_ENCONTRADO", "Brigadista no encontrado", HttpStatus.NOT_FOUND));
        brigadista.setKeycloakSub(keycloakSub);
        if (keycloakUsername != null && !keycloakUsername.isBlank()) {
            brigadista.setKeycloakUsername(keycloakUsername.trim());
        }
        if (email != null && !email.isBlank()) {
            brigadista.setEmail(email.trim());
        }
        return toBrigadistaDto(brigadistaRepository.save(brigadista));
    }

    public AsignacionActivaDto obtenerAsignacionActiva(Long asignacionId) {
        Asignacion asignacion = asignacionRepository.findByIdAndActivaTrue(asignacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "ASIGNACION_NO_ENCONTRADA", "Asignación activa no encontrada", HttpStatus.NOT_FOUND));
        return toAsignacionActivaDto(asignacion);
    }

    public List<AsignacionActivaDto> listarAsignacionesActivasPorBrigada(Long brigadaId) {
        return asignacionRepository.findByBrigadaIdAndActivaTrueOrderByCreatedAtDesc(brigadaId).stream()
                .map(this::toAsignacionActivaDto)
                .toList();
    }

    public List<UUID> listarIncidenteIdsActivosPorBrigada(Long brigadaId) {
        return asignacionRepository.findByBrigadaIdAndActivaTrueOrderByCreatedAtDesc(brigadaId).stream()
                .map(Asignacion::getIncidenteId)
                .distinct()
                .toList();
    }

    public boolean brigadaTieneAsignacionActivaEnIncidente(Long brigadaId, UUID incidenteId) {
        return asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, brigadaId);
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
        int pasajeros = request.getCapacidadPasajeros() != null ? request.getCapacidadPasajeros() : 5;
        int carga = request.getCapacidadCarga() != null ? request.getCapacidadCarga() : 0;
        Vehiculo vehiculo = Vehiculo.builder()
                .patente(request.getPatente().trim().toUpperCase())
                .tipo(request.getTipo().trim().toUpperCase())
                .marca(request.getMarca())
                .modelo(request.getModelo())
                .anio(request.getAnio())
                .capacidadPasajeros(pasajeros)
                .capacidadCarga(carga)
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
        String estado = request.getEstado() != null && !request.getEstado().isBlank()
                ? request.getEstado().trim().toUpperCase()
                : "ACTIVA";
        Herramienta herramienta = Herramienta.builder()
                .nombre(request.getNombre().trim())
                .cantidadTotal(request.getCantidadTotal())
                .cantidadDisponible(request.getCantidadTotal())
                .marca(trimOrNull(request.getMarca()))
                .modelo(trimOrNull(request.getModelo()))
                .sku(trimOrNull(request.getSku()))
                .estado(estado)
                .build();
        return toHerramientaDto(herramientaRepository.save(herramienta));
    }

    @Transactional
    public void desasignar(Long asignacionId) {
        Asignacion asignacion = asignacionRepository.findByIdAndActivaTrue(asignacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "ASIGNACION_NO_ENCONTRADA", "Asignación no encontrada o inactiva", HttpStatus.NOT_FOUND));
        asignacion.setActiva(false);
        asignacion.setEstadoDespacho("LIBERADA");
        asignacion.setFActualizacion(LocalDateTime.now());
        asignacionRepository.save(asignacion);

        Brigada brigada = brigadaRepository.findById(asignacion.getBrigadaId()).orElseThrow();
        brigada.setEstado(EstadoRecurso.DISPONIBLE);
        brigadaRepository.save(brigada);

        if (asignacion.getVehiculoId() != null) {
            Vehiculo vehiculo = vehiculoRepository.findById(asignacion.getVehiculoId()).orElseThrow();
            vehiculo.setEstado(EstadoRecurso.DISPONIBLE);
            vehiculoRepository.save(vehiculo);
        }

        List<AsignacionBrigadista> brigadistasAsignacion =
                asignacionBrigadistaRepository.findByAsignacionId(asignacionId);
        for (AsignacionBrigadista ab : brigadistasAsignacion) {
            Brigadista brigadista = brigadistaRepository.findById(ab.getBrigadistaId()).orElseThrow();
            brigadista.setEstado(EstadoRecurso.DISPONIBLE);
            brigadistaRepository.save(brigadista);
        }
        asignacionBrigadistaRepository.deleteByAsignacionId(asignacionId);
        if (brigadistasAsignacion.isEmpty()) {
            for (Brigadista brigadista : brigadistaRepository.findByIdBrigada(asignacion.getBrigadaId())) {
                if (brigadista.getEstado() == EstadoRecurso.ASIGNADO) {
                    brigadista.setEstado(EstadoRecurso.DISPONIBLE);
                    brigadistaRepository.save(brigadista);
                }
            }
        }

        for (AsignacionHerramienta ah : asignacionHerramientaRepository.findByAsignacionId(asignacionId)) {
            Herramienta herramienta = herramientaRepository.findById(ah.getHerramientaId()).orElseThrow();
            herramienta.setCantidadDisponible(herramienta.getCantidadDisponible() + ah.getCantidad());
            herramientaRepository.save(herramienta);
        }
        asignacionHerramientaRepository.deleteByAsignacionId(asignacionId);
    }

    @Transactional
    public AsignacionActivaDto actualizarEstadoDespacho(Long asignacionId, ActualizarEstadoDespachoRequest request) {
        if (request == null || request.getEstadoDespacho() == null || request.getEstadoDespacho().isBlank()) {
            throw new BusinessRuleException(
                    "DATOS_INVALIDOS", "estadoDespacho es obligatorio", HttpStatus.BAD_REQUEST);
        }
        Asignacion asignacion = asignacionRepository.findByIdAndActivaTrue(asignacionId)
                .orElseThrow(() -> new BusinessRuleException(
                        "ASIGNACION_NO_ENCONTRADA", "Asignación no encontrada o inactiva", HttpStatus.NOT_FOUND));
        String destino = request.getEstadoDespacho().trim().toUpperCase();
        validarTransicionEstadoDespacho(asignacion.getEstadoDespacho(), destino);
        asignacion.setEstadoDespacho(destino);
        asignacion.setFActualizacion(LocalDateTime.now());
        return toAsignacionActivaDto(asignacionRepository.save(asignacion));
    }

    @Transactional
    public void liberarPorIncidente(UUID incidenteId) {
        List<Asignacion> activas = asignacionRepository.findAllByIncidenteIdAndActivaTrue(incidenteId);
        for (Asignacion asignacion : activas) {
            desasignar(asignacion.getId());
        }
    }

    private void validarTransicionEstadoDespacho(String actual, String destino) {
        if (actual == null) {
            throw new BusinessRuleException(
                    "TRANSICION_INVALIDA", "La asignación no tiene estado de despacho", HttpStatus.CONFLICT);
        }
        String origen = actual.trim().toUpperCase();
        if ("ASIGNADA".equals(origen) && "EN_CAMINO".equals(destino)) {
            return;
        }
        if ("EN_CAMINO".equals(origen) && "EN_INCIDENTE".equals(destino)) {
            return;
        }
        throw new BusinessRuleException(
                "TRANSICION_INVALIDA",
                "No se puede pasar de " + origen + " a " + destino,
                HttpStatus.CONFLICT);
    }

    private void aplicarDotacionVehiculos(Long brigadaId, List<Long> vehiculoIds, Long principalVehiculoId) {
        Set<Long> unicos = new HashSet<>(vehiculoIds);
        for (Long vehiculoId : unicos) {
            vehiculoRepository.findById(vehiculoId)
                    .orElseThrow(() -> new BusinessRuleException(
                            "VEHICULO_NO_ENCONTRADO", "Vehículo no encontrado", HttpStatus.NOT_FOUND));
            if (brigadaVehiculoRepository.existsByIdVehiculoAndActivaTrueAndIdBrigadaNot(vehiculoId, brigadaId)) {
                throw new BusinessRuleException(
                        "VEHICULO_EN_OTRA_BRIGADA",
                        "El vehículo ya está asignado activo a otra brigada",
                        HttpStatus.CONFLICT);
            }
        }
        for (BrigadaVehiculo bv : brigadaVehiculoRepository.findByIdBrigada(brigadaId)) {
            if (bv.getActiva()) {
                bv.setActiva(false);
                bv.setFHasta(LocalDateTime.now());
                brigadaVehiculoRepository.save(bv);
            }
        }
        LocalDateTime ahora = LocalDateTime.now();
        for (Long vehiculoId : unicos) {
            brigadaVehiculoRepository.save(BrigadaVehiculo.builder()
                    .idBrigada(brigadaId)
                    .idVehiculo(vehiculoId)
                    .principal(vehiculoId.equals(principalVehiculoId))
                    .activa(true)
                    .fDesde(ahora)
                    .build());
        }
    }

    private void desvincularBrigadistasDeBrigada(Long brigadaId) {
        LocalDateTime ahora = LocalDateTime.now();
        for (BrigadaBrigadista membresia : brigadaBrigadistaRepository.findByBrigadaIdAndActivaTrue(brigadaId)) {
            membresia.setActiva(false);
            membresia.setFHasta(ahora);
            brigadaBrigadistaRepository.save(membresia);
            Brigadista b = brigadistaRepository.findById(membresia.getBrigadistaId()).orElse(null);
            if (b != null) {
                b.setIdBrigada(null);
                b.setIdRolBrigadista(null);
                brigadistaRepository.save(b);
            }
        }
    }

    private void vincularBrigadistaABrigada(Long brigadaId, Long brigadistaId, Long rolId, boolean esJefe) {
        LocalDateTime ahora = LocalDateTime.now();
        brigadaBrigadistaRepository.findByBrigadistaIdAndActivaTrue(brigadistaId).ifPresent(m -> {
            if (!m.getBrigadaId().equals(brigadaId)) {
                m.setActiva(false);
                m.setFHasta(ahora);
                brigadaBrigadistaRepository.save(m);
            }
        });
        brigadaBrigadistaRepository.findByBrigadaIdAndBrigadistaIdAndActivaTrue(brigadaId, brigadistaId)
                .ifPresentOrElse(m -> {
                    m.setIdRolBrigadista(rolId);
                    m.setEsJefe(esJefe);
                    brigadaBrigadistaRepository.save(m);
                }, () -> brigadaBrigadistaRepository.save(BrigadaBrigadista.builder()
                        .brigadaId(brigadaId)
                        .brigadistaId(brigadistaId)
                        .idRolBrigadista(rolId)
                        .esJefe(esJefe)
                        .activa(true)
                        .fDesde(ahora)
                        .build()));
    }

    private Brigada validarBrigadaEditable(Long brigadaId) {
        Brigada brigada = brigadaRepository.findById(brigadaId)
                .orElseThrow(() -> new BusinessRuleException(
                        "BRIGADA_NO_ENCONTRADA", "Brigada no encontrada", HttpStatus.NOT_FOUND));
        if (brigada.getEstado() == EstadoRecurso.ASIGNADO) {
            throw new BusinessRuleException(
                    "BRIGADA_EN_USO",
                    "No se puede editar la composición de una brigada en despacho",
                    HttpStatus.CONFLICT);
        }
        return brigada;
    }

    private void validarBrigadaExiste(Long brigadaId) {
        if (!brigadaRepository.existsById(brigadaId)) {
            throw new BusinessRuleException(
                    "BRIGADA_NO_ENCONTRADA", "Brigada no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    private AsignacionResponse asignarBase(
            UUID incidenteId, Long brigadaId, Long vehiculoId, String despachadoPor) {
        if (asignacionRepository.existsByIncidenteIdAndBrigadaIdAndActivaTrue(incidenteId, brigadaId)) {
            throw new BusinessRuleException(
                    "ASIGNACION_DUPLICADA",
                    "La brigada ya está asignada a este incidente",
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

        LocalDateTime ahora = LocalDateTime.now();
        Asignacion asignacion = Asignacion.builder()
                .incidenteId(incidenteId)
                .brigadaId(brigadaId)
                .activa(true)
                .createdAt(ahora)
                .estadoDespacho("ASIGNADA")
                .despachadoPor(despachadoPor)
                .fActualizacion(ahora)
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

    private boolean tieneComposicionExplicita(AsignarRequest request) {
        return (request.getBrigadistaIds() != null && !request.getBrigadistaIds().isEmpty())
                || (request.getHerramientas() != null && !request.getHerramientas().isEmpty())
                || (request.getVehiculoIds() != null && !request.getVehiculoIds().isEmpty())
                || request.getPrincipalVehiculoId() != null;
    }

    private List<BrigadistaDto> resolverIntegrantesDespacho(BrigadaDetalleDto detalle, AsignarRequest request) {
        List<BrigadistaDto> base =
                detalle.getBrigadistas() != null ? detalle.getBrigadistas() : List.of();
        if (request.getBrigadistaIds() == null || request.getBrigadistaIds().isEmpty()) {
            return base;
        }
        Set<Long> ids = new HashSet<>(request.getBrigadistaIds());
        return base.stream().filter(b -> ids.contains(b.getId())).toList();
    }

    private List<BrigadaHerramientaItemDto> resolverKitDespacho(BrigadaDetalleDto detalle, AsignarRequest request) {
        if (request.getHerramientas() != null && !request.getHerramientas().isEmpty()) {
            return request.getHerramientas().stream()
                    .map(h -> BrigadaHerramientaItemDto.builder()
                            .herramientaId(h.getHerramientaId())
                            .cantidad(h.getCantidad())
                            .nombre(herramientaRepository
                                    .findById(h.getHerramientaId())
                                    .map(Herramienta::getNombre)
                                    .orElse("Herramienta"))
                            .build())
                    .toList();
        }
        return detalle.getHerramientas() != null ? detalle.getHerramientas() : List.of();
    }

    private int sumCapacidadPasajerosVehiculosDespacho(BrigadaDetalleDto detalle, AsignarRequest request) {
        List<Long> vehiculoIds;
        if (request.getVehiculoIds() != null && !request.getVehiculoIds().isEmpty()) {
            vehiculoIds = request.getVehiculoIds();
        } else if (detalle.getVehiculos() != null && !detalle.getVehiculos().isEmpty()) {
            vehiculoIds = detalle.getVehiculos().stream().map(BrigadaVehiculoDto::getVehiculoId).toList();
        } else if (request.getPrincipalVehiculoId() != null) {
            vehiculoIds = List.of(request.getPrincipalVehiculoId());
        } else if (request.getVehiculoId() != null) {
            vehiculoIds = List.of(request.getVehiculoId());
        } else if (detalle.getVehiculoId() != null) {
            vehiculoIds = List.of(detalle.getVehiculoId());
        } else {
            return 0;
        }
        int sum = 0;
        for (Long vehiculoId : vehiculoIds) {
            Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId).orElse(null);
            if (vehiculo != null && vehiculo.getCapacidadPasajeros() != null) {
                sum += vehiculo.getCapacidadPasajeros();
            }
        }
        return sum;
    }

    private Long resolverVehiculoPrincipalDespacho(BrigadaDetalleDto detalle, AsignarRequest request) {
        if (request.getVehiculoId() != null) {
            return request.getVehiculoId();
        }
        if (request.getPrincipalVehiculoId() != null) {
            return request.getPrincipalVehiculoId();
        }
        if (request.getVehiculoIds() != null && !request.getVehiculoIds().isEmpty()) {
            return request.getVehiculoIds().getFirst();
        }
        if (detalle.getVehiculoId() != null) {
            return detalle.getVehiculoId();
        }
        if (detalle.getVehiculos() != null && !detalle.getVehiculos().isEmpty()) {
            return detalle.getVehiculos().stream()
                    .filter(BrigadaVehiculoDto::isPrincipal)
                    .map(BrigadaVehiculoDto::getVehiculoId)
                    .findFirst()
                    .orElse(detalle.getVehiculos().getFirst().getVehiculoId());
        }
        return null;
    }

    private void validarComposicionDespacho(
            BrigadaDetalleDto detalle,
            List<BrigadistaDto> integrantes,
            List<BrigadaHerramientaItemDto> kit) {
        if (detalle.getIdJefeBrigadista() != null
                && integrantes.stream().noneMatch(b -> detalle.getIdJefeBrigadista().equals(b.getId()))) {
            throw new BusinessRuleException(
                    "JEFE_REQUERIDO", "El jefe de brigada debe incluirse en el despacho", HttpStatus.BAD_REQUEST);
        }
        if (integrantes.isEmpty()) {
            throw new BusinessRuleException(
                    "SIN_INTEGRANTES", "Debe incluir al menos un integrante en el despacho", HttpStatus.BAD_REQUEST);
        }
        if (integrantes.size() > detalle.getCapacidad()) {
            throw new BusinessRuleException(
                    "CUPO_EXCEDIDO",
                    "Los integrantes del despacho superan el cupo de la brigada",
                    HttpStatus.BAD_REQUEST);
        }
        if (kit.isEmpty()) {
            throw new BusinessRuleException(
                    "SIN_HERRAMIENTAS",
                    "Debe incluir al menos una herramienta en el despacho",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void aplicarComposicionEnDespacho(
            Long asignacionId, List<BrigadistaDto> integrantes, List<BrigadaHerramientaItemDto> kit) {
        for (BrigadistaDto brigadista : integrantes) {
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

        for (BrigadaHerramientaItemDto item : kit) {
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
        List<BrigadaVehiculoDto> vehiculosDotacion =
                brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigada.getId()).stream()
                        .map(this::toBrigadaVehiculoDto)
                        .toList();

        VehiculoDto vehiculoPrincipalDto = null;
        Long vehiculoPrincipalId = null;
        boolean vehiculoOk = false;
        for (BrigadaVehiculoDto bv : vehiculosDotacion) {
            if (bv.isPrincipal()) {
                vehiculoPrincipalId = bv.getVehiculoId();
                Vehiculo v = vehiculoRepository.findById(bv.getVehiculoId()).orElse(null);
                if (v != null) {
                    vehiculoPrincipalDto = toVehiculoDto(v);
                    vehiculoOk = v.getEstado() == EstadoRecurso.DISPONIBLE;
                }
                break;
            }
        }
        if (vehiculoPrincipalId == null && !vehiculosDotacion.isEmpty()) {
            BrigadaVehiculoDto first = vehiculosDotacion.getFirst();
            vehiculoPrincipalId = first.getVehiculoId();
            Vehiculo v = vehiculoRepository.findById(first.getVehiculoId()).orElse(null);
            if (v != null) {
                vehiculoPrincipalDto = toVehiculoDto(v);
                vehiculoOk = v.getEstado() == EstadoRecurso.DISPONIBLE;
            }
        }
        if (vehiculosDotacion.isEmpty()) {
            vehiculoOk = false;
        }

        List<BrigadistaDto> brigadistas = brigadaBrigadistaRepository.findByBrigadaIdAndActivaTrue(brigada.getId()).stream()
                .map(m -> brigadistaRepository.findById(m.getBrigadistaId()).orElse(null))
                .filter(b -> b != null)
                .map(this::toBrigadistaDto)
                .toList();

        BrigadistaDto jefeDto = null;
        if (brigada.getIdJefeBrigadista() != null) {
            jefeDto = brigadistaRepository.findById(brigada.getIdJefeBrigadista()).map(this::toBrigadistaDto).orElse(null);
        }

        boolean jefeOk = brigada.getIdJefeBrigadista() != null && jefeDto != null;
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
                && jefeOk
                && vehiculoOk
                && !vehiculosDotacion.isEmpty()
                && brigadistasOk
                && herramientasOk;

        return BrigadaDetalleDto.builder()
                .id(brigada.getId())
                .nombre(brigada.getNombre())
                .capacidad(brigada.getCapacidad())
                .estado(brigada.getEstado())
                .vehiculoId(vehiculoPrincipalId)
                .vehiculo(vehiculoPrincipalDto)
                .vehiculos(vehiculosDotacion)
                .idJefeBrigadista(brigada.getIdJefeBrigadista())
                .jefe(jefeDto)
                .brigadistas(brigadistas)
                .herramientas(herramientas)
                .listaParaDespacho(listaParaDespacho)
                .build();
    }

    private BrigadaVehiculoDto toBrigadaVehiculoDto(BrigadaVehiculo bv) {
        Vehiculo v = vehiculoRepository.findById(bv.getIdVehiculo()).orElse(null);
        return BrigadaVehiculoDto.builder()
                .id(bv.getId())
                .vehiculoId(bv.getIdVehiculo())
                .patente(v != null ? v.getPatente() : null)
                .tipo(v != null ? v.getTipo() : null)
                .capacidadPasajeros(v != null ? v.getCapacidadPasajeros() : null)
                .principal(Boolean.TRUE.equals(bv.getPrincipal()))
                .activa(Boolean.TRUE.equals(bv.getActiva()))
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
        Long vehiculoPrincipal = brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigada.getId()).stream()
                .filter(BrigadaVehiculo::getPrincipal)
                .map(BrigadaVehiculo::getIdVehiculo)
                .findFirst()
                .orElse(brigadaVehiculoRepository.findByIdBrigadaAndActivaTrue(brigada.getId()).stream()
                        .map(BrigadaVehiculo::getIdVehiculo)
                        .findFirst()
                        .orElse(null));
        return BrigadaDto.builder()
                .id(brigada.getId())
                .nombre(brigada.getNombre())
                .capacidad(brigada.getCapacidad())
                .estado(brigada.getEstado())
                .codigo(brigada.getCodigo())
                .idCompania(brigada.getIdCompania())
                .idJefeBrigadista(brigada.getIdJefeBrigadista())
                .vehiculoId(vehiculoPrincipal)
                .build();
    }

    private BrigadistaDto toBrigadistaDto(Brigadista brigadista) {
        String rolCodigo = null;
        String rolNombre = null;
        if (brigadista.getIdRolBrigadista() != null) {
            BrigadistaRol rol = brigadistaRolRepository.findById(brigadista.getIdRolBrigadista()).orElse(null);
            if (rol != null) {
                rolCodigo = rol.getCodigo();
                rolNombre = rol.getNombre();
            }
        }
        Boolean esJefe = brigadaBrigadistaRepository
                .findByBrigadistaIdAndActivaTrue(brigadista.getId())
                .map(BrigadaBrigadista::getEsJefe)
                .orElse(null);
        return BrigadistaDto.builder()
                .id(brigadista.getId())
                .nombre(brigadista.getNombre())
                .apellido(brigadista.getApellido())
                .rut(brigadista.getRut())
                .especialidad(brigadista.getEspecialidad())
                .estado(brigadista.getEstado())
                .idBrigada(brigadista.getIdBrigada())
                .idRolBrigadista(brigadista.getIdRolBrigadista())
                .rolCodigo(rolCodigo)
                .rolNombre(rolNombre)
                .keycloakUsername(brigadista.getKeycloakUsername())
                .email(brigadista.getEmail())
                .esJefe(esJefe)
                .build();
    }

    private VehiculoDto toVehiculoDto(Vehiculo vehiculo) {
        return VehiculoDto.builder()
                .id(vehiculo.getId())
                .patente(vehiculo.getPatente())
                .tipo(vehiculo.getTipo())
                .marca(vehiculo.getMarca())
                .modelo(vehiculo.getModelo())
                .anio(vehiculo.getAnio())
                .capacidadPasajeros(vehiculo.getCapacidadPasajeros())
                .capacidadCarga(vehiculo.getCapacidadCarga())
                .estado(vehiculo.getEstado())
                .build();
    }

    private HerramientaDto toHerramientaDto(Herramienta herramienta) {
        return HerramientaDto.builder()
                .id(herramienta.getId())
                .nombre(herramienta.getNombre())
                .cantidadTotal(herramienta.getCantidadTotal())
                .cantidadDisponible(herramienta.getCantidadDisponible())
                .marca(herramienta.getMarca())
                .modelo(herramienta.getModelo())
                .sku(herramienta.getSku())
                .estado(herramienta.getEstado())
                .build();
    }

    private BrigadistaRolDto toBrigadistaRolDto(BrigadistaRol rol) {
        return BrigadistaRolDto.builder()
                .id(rol.getId())
                .codigo(rol.getCodigo())
                .nombre(rol.getNombre())
                .jerarquia(rol.getJerarquia())
                .estado(rol.getEstado())
                .build();
    }

    private static String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private InstitucionDto toInstitucionDto(Institucion i) {
        return InstitucionDto.builder()
                .id(i.getId())
                .codigo(i.getCodigo())
                .nombre(i.getNombre())
                .estado(i.getEstado())
                .build();
    }

    private CompaniaDto toCompaniaDto(Compania c) {
        String nombreComuna = comunaRepository.findById(c.getIdComuna()).map(Comuna::getNombre).orElse(null);
        return CompaniaDto.builder()
                .id(c.getId())
                .idInstitucion(c.getIdInstitucion())
                .idComuna(c.getIdComuna())
                .nombreComuna(nombreComuna)
                .codigo(c.getCodigo())
                .nombre(c.getNombre())
                .estado(c.getEstado())
                .build();
    }

    private ComunaDto toComunaDto(Comuna c) {
        return ComunaDto.builder()
                .codigoCasen(c.getCodigoCasen())
                .nombre(c.getNombre())
                .codigoProvinciaCasen(c.getCodigoProvinciaCasen())
                .build();
    }

    private AsignacionActivaDto toAsignacionActivaDto(Asignacion asignacion) {
        Brigada brigada = brigadaRepository.findById(asignacion.getBrigadaId()).orElse(null);
        String patente = null;
        if (asignacion.getVehiculoId() != null) {
            patente = vehiculoRepository.findById(asignacion.getVehiculoId()).map(Vehiculo::getPatente).orElse(null);
        }
        return AsignacionActivaDto.builder()
                .id(asignacion.getId())
                .incidenteId(asignacion.getIncidenteId())
                .brigadaId(asignacion.getBrigadaId())
                .brigadaNombre(brigada != null ? brigada.getNombre() : null)
                .vehiculoId(asignacion.getVehiculoId())
                .vehiculoPatente(patente)
                .estadoDespacho(asignacion.getEstadoDespacho())
                .despachadoPor(asignacion.getDespachadoPor())
                .createdAt(asignacion.getCreatedAt())
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
