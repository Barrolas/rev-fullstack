# Matriz de pruebas — EVA3 REV

| Campo | Valor |
|-------|-------|
| **Proyecto** | REV — Red de Emergencia Valle |
| **Versión matriz** | 2.0 (segunda pasada 2026-06-29) |
| **Referencia** | [plan-de-pruebas-eva3.md](./plan-de-pruebas-eva3.md) |

**Instrucciones:** completar columna **Resultado obtenido** y **Evidencia** al ejecutar cada prueba. Exportar a Excel para Blackboard si el docente lo solicita.

---

## Leyenda

| Estado | Significado |
|--------|-------------|
| PASS | Resultado coincide con lo esperado |
| FAIL | Discrepancia; registrar bug |
| BLOCK | No ejecutable (dependencia caída) |
| N/A | No aplica en esta iteración |

| Severidad bug | Criterio |
|---------------|----------|
| Alta | Impide operación crítica (despacho, seguridad) |
| Media | Funcionalidad degradada con workaround |
| Baja | Cosmético o documentación |

---

## Matriz principal (mínimo 3×3)

| ID | Tipo | Área crítica | Caso de prueba | Patrón | Precondición | Pasos | Resultado esperado | Resultado obtenido | Evidencia | Bug / fix |
|----|------|--------------|----------------|--------|--------------|-------|-------------------|-------------------|-----------|-----------|
| UT-01 | Unit | Transición estado | Incidente REPORTADO sin lat/lng no puede pasar a EN_PROGRESO | Factory + State | Incidente sin coordenadas | Ejecutar `IncidentStateFactoryTest.enProgresoRequiereGeorreferenciacion` | `assertThrows(Exception)` | PASS | resumen-ejecucion 2026-06-28 + JaCoCo | Validación geo implementada en Factory |
| UT-02 | Unit | Transición estado | Incidente con geo válida permite EN_PROGRESO | Factory + State | lat/lng presentes | `IncidentStateFactoryTest.enProgresoConGeoEsValido` | `assertDoesNotThrow` | PASS | resumen-ejecucion 2026-06-28 | — |
| UT-03 | Unit | Correlación | Revertir correlación CONFIRMADA desvincula par y vuelve a PENDIENTE | — | Correlación mock confirmada | `CorrelacionServiceTest.revertir_desvinculaSoloElParYVuelveAPendiente` | Estado PENDIENTE; `incidenteB.incidenteCanonicoId == null` | PASS | resumen-ejecucion 2026-06-28 | Feature revertir EVA2 |
| UT-04 | Unit | Correlación | Revertir correlación PENDIENTE lanza excepción (caso negativo) | — | Correlación pendiente | `CorrelacionServiceTest.revertir_fallaSiNoEstaConfirmada` | `BusinessRuleException` | PASS | resumen-ejecucion 2026-06-28 | Regla negocio |
| UT-05 | Unit | Recursos | Asignar misma brigada al mismo incidente activo → duplicada | — | Asignación activa existe | `RecursoServiceAsignarMultiTest.asignar_mismaBrigadaMismoIncidente_lanzaDuplicada` | `BusinessRuleException` code `ASIGNACION_DUPLICADA` | PASS | resumen-ejecucion 2026-06-28 | Fix mock BrigadaBrigadistaRepository |
| UT-06 | Unit | Zonas | Crear zona con nivel inválido rechaza | — | Request nivel `CRITICO` | `ZonaServiceTest.crear_nivelInvalido_lanzaExcepcion` | `BusinessRuleException` | PASS | resumen-ejecucion 2026-06-28 | Validación catálogo riesgo |
| UT-07 | Unit | Zonas | Resolver punto con solapamiento elige zona menor radio | — | 2 zonas activas solapadas | `ZonaServiceTest.resolverPunto_solapamiento_eligeMenorRadio` | Retorna zona id=2 (radio 800 m) | PASS | resumen-ejecucion 2026-06-28 | Lógica territorial |
| UT-08 | Unit | BFF correlación | Preview revertir con asignaciones activas → bloqueado | Facade | Asignación activa en canónico | `CorrelacionFacadeServiceTest.previewRevertir_marcaBloqueadoConAsignacionesActivas` | `CorrelacionBloqueadaException`; no llama revertir | PASS | resumen-ejecucion 2026-06-28 | Orquestación BFF |
| IT-01 | Integración | ms-incidentes | Contexto Spring Boot levanta con perfil test | — | H2 + `application-test.properties` | `MsIncidentesApplicationTests.contextLoads` | Contexto OK | PASS | resumen-ejecucion 2026-06-28 | Smoke integración |
| IT-02 | Integración | ms-incidentes | Factory inyectado en contexto Spring valida geo | Factory + State | `@SpringBootTest` + `@ActiveProfiles("test")` | `IncidentStateFactoryTest` (ambos métodos) | Tests PASS en contexto real | PASS | resumen-ejecucion 2026-06-28 | Integración bean |
| IT-03 | Integración | bff-rev | Contexto BFF levanta | — | Perfil test | `ApplicationTests.contextLoads` | Contexto OK | PASS | resumen-ejecucion 2026-06-28 | Smoke |
| IT-04 | Integración | bff-rev | Revertir con reasignación transfiere asignaciones antes de revertir | Facade | Mock clients WebClient | `CorrelacionFacadeServiceTest.revertir_conReasignacion_transfiereYRevertir` | `transferirIncidente` + `revertir` invocados | PASS | resumen-ejecucion 2026-06-28 | Flujo multi-servicio |
| IT-05 | Integración | ms-recursos | Contexto Spring levanta | — | Perfil test | `ApplicationTests.contextLoads` | Contexto OK | PASS | resumen-ejecucion 2026-06-28 | Smoke |
| IT-06 | Integración | ms-zonas | Contexto Spring levanta | — | Perfil test | `ApplicationTests.contextLoads` | Contexto OK | PASS | resumen-ejecucion 2026-06-28 | Smoke |
| E2E-01 | E2E | Despacho | Login despachador → cola → asignar brigada → activos | — | Stack Docker UP; datos sembrados | 1. POST login 2. `/despacho/operacion` 3. Seleccionar incidente 4. Despacho rápido MUN-REFUERZO | Brigada en pestaña Activos; estado ASIGNADA en Recursos | Pendiente | Video plataforma §Despacho | Ver guion plataforma |
| E2E-02 | E2E | Portal ciudadano | Reporte público sin login aparece en cola despacho | — | Ventana incógnito | 1. `/portal#reportar` 2. Enviar reporte GPS 3. Login despachador 4. Ver cola | Nuevo folio visible en cola | Pendiente | Video plataforma §Portal | Flujo crítico ciudadano |
| E2E-03 | E2E | Seguridad | GET `/api/incidentes` sin JWT → 401 | — | Gateway UP | `curl` sin header Authorization | HTTP 401 Unauthorized | Pendiente | Video pruebas §5 | Perímetro Gateway |
| E2E-04 | E2E | Seguridad | Login válido → GET incidentes con Bearer → 200 | — | Credenciales despachador | 1. POST `/auth/login` 2. GET con token | HTTP 200 + JSON | Pendiente | Video pruebas §5 | — |
| E2E-05 | E2E | Correlaciones | Dos reportes cercanos generan sugerencia pendiente | — | Reportes A+C sembrados | `/incidentes` → Correlaciones → Pendientes | ≥ 1 correlación pendiente | Pendiente | Video plataforma §Incidentes | Geo + scorer |
| E2E-06 | E2E | Resiliencia UI | Dashboard muestra alerta si BFF degraded | Circuit Breaker | Simular fallo zonas (opcional) o mencionar en demo | Login → inicio con flag degraded | `DegradedAlert` visible | Pendiente | Video arquitectura / plataforma | Modo degradado |

### Segunda pasada v2 (2026-06-29) — ampliación cobertura

| ID | Tipo | Área crítica | Caso de prueba | Patrón | Resultado obtenido | Evidencia |
|----|------|--------------|----------------|--------|-------------------|-----------|
| UT-09 | Unit | Incidentes | Reporte público sin ubicación rechazado | — | PASS | resumen-ejecucion v2 |
| UT-10 | Unit | Incidentes | crearPublico con coords + correlación | — | PASS | IncidenteServiceTest |
| UT-11 | Unit | Incidentes | obtener NOT_FOUND | — | PASS | IncidenteServiceTest |
| UT-12 | Unit | Incidentes | transicionar guarda historial | Factory + State | PASS | IncidenteServiceTest |
| UT-13 | Unit | Incidentes | timeline REGISTRO+TRANSICION | — | PASS | IncidenteServiceTest |
| UT-14 | Unit | Estado | EN_PROGRESO → CONTROLADO/ESCALADO | Factory + State | PASS | IncidentStateFactoryTest |
| UT-15 | Unit | Estado | REPORTADO no salta a CONTROLADO | Factory + State | PASS | IncidentStateFactoryTest |
| UT-16 | Unit | Estado | CONTROLADO solo → CERRADO | Factory + State | PASS | IncidentStateFactoryTest |
| UT-17 | Unit | Recursos | desasignar libera brigada | — | PASS | RecursoServiceDespachoTest |
| UT-18 | Unit | Recursos | ASIGNADA → EN_CAMINO | — | PASS | RecursoServiceDespachoTest |
| UT-19 | Unit | Recursos | transición despacho inválida | — | PASS | RecursoServiceDespachoTest |
| UT-20 | Unit | Zonas | consultarRiesgo + clima Adapter | Adapter | PASS | ZonaServiceTest |
| UT-21 | Unit | Zonas | actualizar zona | — | PASS | ZonaServiceTest |
| UT-22 | Unit | BFF seguridad | requireOperador sin rol | — | PASS | AuthorizationServiceTest |
| UT-23 | Unit | BFF seguridad | resolverPerfil brigadista jefe | — | PASS | AuthorizationServiceTest |
| UT-24 | Unit | BFF operaciones | crearZona sin nombre | Facade | PASS | OperacionesFacadeServiceTest |
| UT-25 | Unit | BFF dashboard | listarDashboards vacío | Facade | PASS | DashboardFacadeServiceTest |
| IT-07 | Integración | ms-incidentes | State factory transiciones v2 en Spring | Factory + State | PASS | IncidentStateFactoryTest |

Detalle de cambios: [registro-cambios-pruebas-v2.md](./registro-cambios-pruebas-v2.md).

---

## Registro de bugs y mejoras detectados por pruebas

| Bug ID | Prueba que lo detectó | Descripción | Severidad | Cambio en software | Commit / referencia |
|--------|----------------------|-------------|-----------|-------------------|---------------------|
| BUG-01 | UT-01 / E2E manual | Sin georref se podía intentar EN_PROGRESO desde UI | Alta | Validación en `IncidentStateFactory` + mensaje UI | `IncidentStateFactoryTest` |
| BUG-02 | UT-05 | Doble asignación misma brigada/incidente | Media | Código `ASIGNACION_DUPLICADA` en `RecursoService` | `RecursoServiceAsignarMultiTest` |
| BUG-03 | UT-08 / IT-04 | Revertir correlación con brigadas activas dejaba inconsistencia | Alta | `CorrelacionBloqueadaException` + flujo reasignar | `CorrelacionFacadeServiceTest` |
| BUG-04 | E2E-03 | Endpoints protegidos accesibles sin token | Alta | `AuthenticationFilter` en Gateway | Video pruebas curl |
| BUG-05 | UT-05 (ejecución EVA3) | Test fallaba con NPE por mock faltante `BrigadaBrigadistaRepository` | Media | Agregado mock en `RecursoServiceAsignarMultiTest` | Fix test 2026-06-28 |

---

## Trazabilidad tests → archivos

| ID | Clase de test | Ruta |
|----|---------------|------|
| UT-01, UT-02, IT-02 | `IncidentStateFactoryTest` | `businessdomain/ms-incidentes/src/test/java/.../IncidentStateFactoryTest.java` |
| UT-03, UT-04 | `CorrelacionServiceTest` | `businessdomain/ms-incidentes/src/test/java/.../service/CorrelacionServiceTest.java` |
| UT-05 | `RecursoServiceAsignarMultiTest` | `businessdomain/ms-recursos/src/test/java/.../RecursoServiceAsignarMultiTest.java` |
| UT-06, UT-07 | `ZonaServiceTest` | `businessdomain/ms-zonas-riesgo/src/test/java/.../ZonaServiceTest.java` |
| UT-08, IT-04 | `CorrelacionFacadeServiceTest` | `infraestructuredomain/bff-rev/src/test/java/.../CorrelacionFacadeServiceTest.java` |
| IT-01 | `MsIncidentesApplicationTests` | `businessdomain/ms-incidentes/src/test/java/.../MsIncidentesApplicationTests.java` |
| IT-03 | `ApplicationTests` (bff) | `infraestructuredomain/bff-rev/src/test/java/.../ApplicationTests.java` |
| IT-05 | `ApplicationTests` (recursos) | `businessdomain/ms-recursos/src/test/java/.../ApplicationTests.java` |
| IT-06 | `ApplicationTests` (zonas) | `businessdomain/ms-zonas-riesgo/src/test/java/.../ApplicationTests.java` |
| UT-09…UT-13 | `IncidenteServiceTest` | `businessdomain/ms-incidentes/src/test/java/.../service/IncidenteServiceTest.java` |
| UT-14…UT-16, IT-07 | `IncidentStateFactoryTest` | `businessdomain/ms-incidentes/src/test/java/.../IncidentStateFactoryTest.java` |
| UT-17…UT-19 | `RecursoServiceDespachoTest` | `businessdomain/ms-recursos/src/test/java/.../RecursoServiceDespachoTest.java` |
| UT-20, UT-21 | `ZonaServiceTest` | `businessdomain/ms-zonas-riesgo/src/test/java/.../ZonaServiceTest.java` |
| UT-22, UT-23 | `AuthorizationServiceTest` | `infraestructuredomain/bff-rev/src/test/java/.../security/AuthorizationServiceTest.java` |
| UT-24 | `OperacionesFacadeServiceTest` | `infraestructuredomain/bff-rev/src/test/java/.../OperacionesFacadeServiceTest.java` |
| UT-25 | `DashboardFacadeServiceTest` | `infraestructuredomain/bff-rev/src/test/java/.../DashboardFacadeServiceTest.java` |

---

## Cobertura JaCoCo

### v2.0 (2026-06-29)

| Módulo | Instrucciones % | Δ vs v1 | Fecha | Reporte |
|--------|-----------------|---------|-------|---------|
| ms-incidentes | **41.8%** | +11.9 pp | 2026-06-29 | `target/site/jacoco/index.html` |
| bff-rev | **8.9%** | +3.5 pp | 2026-06-29 | idem |
| ms-recursos | **22.3%** | +5.6 pp | 2026-06-29 | idem |
| ms-zonas-riesgo | **69.7%** | +12.7 pp ✓ | 2026-06-29 | idem |
| `incidentes.state` | 79.5% | +15.1 pp | | |
| `incidentes.service` | 33.3% | +16.5 pp | | |
| `zonas.service` | 83.6% | +24.9 pp | | |
| `bff.security` | 42.9% | nuevo | | |

### v1.0 (referencia 2026-06-28)

| Módulo | Instrucciones % |
|--------|-----------------|
| ms-incidentes | 29.9% |
| bff-rev | 5.4% |
| ms-recursos | 16.7% |
| ms-zonas-riesgo | 57.0% |

---

## Comandos de ejecución por fila

```powershell
# Unit + integración ms-incidentes (UT-01 a UT-04, IT-01, IT-02)
cd businessdomain\ms-incidentes
..\..\mvnw.cmd test -Dtest=IncidentStateFactoryTest,CorrelacionServiceTest,MsIncidentesApplicationTests jacoco:report

# bff-rev (UT-08, IT-03, IT-04)
cd ..\..\infraestructuredomain\bff-rev
..\..\mvnw.cmd test -Dtest=CorrelacionFacadeServiceTest,ApplicationTests jacoco:report

# ms-recursos (UT-05, IT-05)
cd ..\..\businessdomain\ms-recursos
..\..\mvnw.cmd test -Dtest=RecursoServiceAsignarMultiTest,ApplicationTests jacoco:report

# ms-zonas (UT-06, UT-07, IT-06)
cd ..\..\businessdomain\ms-zonas-riesgo
..\..\mvnw.cmd test -Dtest=ZonaServiceTest,ApplicationTests jacoco:report
```

### E2E curl (E2E-03, E2E-04)

```powershell
# Sin token — esperar 401
curl.exe -s -w "\nHTTP:%{http_code}" "http://localhost:18080/api/incidentes"

# Con login
curl.exe -s -X POST "http://localhost:18080/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=despachador&password=rev123"
# Copiar access_token y:
curl.exe -s -w "\nHTTP:%{http_code}" "http://localhost:18080/api/incidentes" -H "Authorization: Bearer <TOKEN>"
```
