# Plan de pruebas — EVA3 REV

| Campo | Valor |
|-------|-------|
| **Proyecto** | REV — Red de Emergencia Valle |
| **Versión** | 1.0 |
| **Fecha** | Junio 2026 |
| **Responsable** | Nicolás Barra |
| **Revisión** | Giannina Guerrero |

---

## 1. Objetivo

Validar la calidad del sistema REV en los **flujos críticos del negocio municipal de emergencias**:

- Ciclo de vida de incidentes (transiciones de estado, georreferenciación).
- Correlación geográfica de reportes (confirmar, descartar, revertir).
- Asignación y disponibilidad de brigadas.
- Autenticación y autorización vía API Gateway + JWT.
- Portal ciudadano (reporte público → cola de despacho).
- Resiliencia del BFF ante fallos de microservicios secundarios.

El plan responde a la Evaluación Parcial 3 (indicador 4: cobertura ≥ 60 %) y a las aclaraciones del docente: pruebas orientadas a **detectar bugs y vulnerabilidades**, no solo al camino feliz.

---

## 2. Alcance

### 2.1 In scope

| Componente | Ruta | Prioridad |
|------------|------|-----------|
| ms-incidentes | `businessdomain/ms-incidentes` | Alta |
| ms-recursos | `businessdomain/ms-recursos` | Alta |
| ms-zonas-riesgo | `businessdomain/ms-zonas-riesgo` | Alta |
| bff-rev | `infraestructuredomain/bff-rev` | Alta |
| frontend rev-dashboard | `frontend/rev-dashboard` | Media (E2E manual) |
| API Gateway | `infraestructuredomain/api-gateway` | Media (E2E seguridad) |

### 2.2 Out of scope

| Componente | Motivo |
|------------|--------|
| eureka-server | Smoke test de arranque únicamente |
| keycloak-adapter | Cubierto en E2E de login |
| spring-boot-admin | Verificación manual en video arquitectura |

---

## 3. Tipos de prueba y mínimos

Según docente: **al menos 3 pruebas unitarias, 3 de integración y 3 end-to-end** en lugares críticos.

| Tipo | Herramienta | Cantidad mínima | Ubicación |
|------|-------------|-----------------|-----------|
| **Unitarias** | JUnit 5 + Mockito | ≥ 3 | Services, Factory, utilidades |
| **Integración** | `@SpringBootTest`, H2, MockMvc, mocks reactivos BFF | ≥ 3 | Contexto Spring + orquestación BFF |
| **End-to-end** | Manual: curl/Postman + UI navegador | ≥ 3 | Flujos completos usuario |

Detalle trazable: [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md).

---

## 4. Áreas críticas del negocio

| # | Área | Riesgo si falla | Componente principal |
|---|------|-----------------|----------------------|
| 1 | Transición a EN_PROGRESO sin coordenadas | Despacho a ubicación inválida | `IncidentStateFactory` |
| 2 | Correlación incorrecta o irreversible | Duplicidad operativa o pérdida de trazabilidad | `CorrelacionService`, `CorrelacionFacadeService` |
| 3 | Asignación duplicada de brigada | Dos incidentes compitiendo por mismo recurso | `RecursoService` |
| 4 | Resolución de zona de riesgo | Clasificación errónea del incidente | `ZonaService` |
| 5 | Acceso sin token | Exposición de datos operativos | `AuthenticationFilter` (Gateway) |
| 6 | Portal → despacho | Ciudadano reporta y operador no ve alerta | Frontend + BFF + ms-incidentes |

---

## 5. Estrategia por tipo

### 5.1 Pruebas unitarias

- **Enfoque:** lógica de negocio aislada con mocks (repositorios, clientes WebClient).
- **Patrones bajo prueba:** Factory+State (incidentes), Facade (BFF), Adapter (clima zonas).
- **Casos negativos obligatorios:**
  - Incidente sin lat/lng → rechazo transición.
  - Revertir correlación no confirmada → `BusinessRuleException`.
  - Nivel de riesgo inválido en zona → `BusinessRuleException`.
  - Asignación duplicada → código `ASIGNACION_DUPLICADA`.

### 5.2 Pruebas de integración

- **Enfoque:** levantar contexto Spring con perfil `test` y H2 (`application-test.properties`).
- **BFF:** tests de fachada con clientes mockeados (WebClient reactivo).
- **ms-incidentes:** `@SpringBootTest` con `IncidentStateFactory` inyectado.
- **Validación:** persistencia simulada vía mocks o H2 según test.

### 5.3 Pruebas end-to-end (manual)

- **Precondición:** stack Docker levantado (`.\scripts\dev-up.ps1 -DockerApps -Build`).
- **Herramientas:** navegador Chrome, curl/Postman, ventana incógnito para portal.
- **Evidencia:** video plataforma + video ejecución pruebas + capturas en `evidencias/`.

---

## 6. Ambientes

| Ambiente | Uso | Comando |
|----------|-----|---------|
| Local Docker | E2E, demos, videos | `.\scripts\dev-up.ps1 -DockerApps -Build` |
| Maven test (H2) | Unit + integración | `mvnw.cmd test` por módulo |
| Reset demo | Datos limpios pre-grabación | `.\scripts\reset-operacion-despacho.ps1 -ResetVolumes` |

### URLs locales

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:15173 |
| Gateway | http://localhost:18080 |
| Eureka | http://localhost:18761 |
| Spring Boot Admin | http://localhost:18099 |

---

## 7. Herramientas y métricas

| Herramienta | Propósito |
|-------------|-----------|
| JUnit 5 | Framework de tests Java |
| Mockito | Mocks en unit tests |
| JaCoCo | Cobertura de código (meta **≥ 60 %** por módulo crítico) |
| Maven Surefire | Ejecución de tests |
| curl / Postman | E2E API |
| OBS / Game Bar | Evidencia en video |

### Comandos de cobertura

```powershell
# Desde la raíz del repo
cd businessdomain\ms-incidentes
..\..\mvnw.cmd test jacoco:report
# Reporte: target\site\jacoco\index.html

cd ..\..\infraestructuredomain\bff-rev
..\..\mvnw.cmd test jacoco:report

cd ..\..\businessdomain\ms-recursos
..\..\mvnw.cmd test jacoco:report

cd ..\..\businessdomain\ms-zonas-riesgo
..\..\mvnw.cmd test jacoco:report
```

---

## 8. Criterios de aceptación

| Criterio | Umbral |
|----------|--------|
| Tests unitarios críticos | 100 % PASS |
| Cobertura JaCoCo (módulos negocio + BFF) | ≥ 60 % instrucciones |
| E2E manuales | 3/3 escenarios OK documentados |
| Casos negativos | ≥ 3 documentados con resultado esperado vs obtenido |
| Bugs encontrados | Registrados en informe con severidad y fix/commit |

---

## 9. Entregables de prueba

| Entregable | Ubicación |
|------------|-----------|
| Código tests | `*/src/test/java` |
| Reportes JaCoCo HTML | `*/target/site/jacoco/` |
| Matriz de pruebas | [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md) |
| Informe final | [informe-pruebas-eva3.md](./informe-pruebas-eva3.md) |
| Capturas | `docs/informe-evidencias/eva3/evidencias/` |
| Video ejecución | Guion opcional defensa: [guion-video-ejecucion-pruebas-eva3.md](./guion-video-ejecucion-pruebas-eva3.md) |

---

## 10. Resultados de ejecución (2026-06-28)

Comando: `.\scripts\run-eva3-tests.ps1` · Evidencia: [evidencias/resumen-ejecucion.txt](./evidencias/resumen-ejecucion.txt)

| Módulo | Exit | Cobertura instrucciones | Estado |
|--------|------|-------------------------|--------|
| ms-incidentes | 0 | 29.9% (899/3003) | PASS — paquetes `correlacion` 78%, `state` 64.4% |
| bff-rev | 0 | 5.4% (266/4884) | PASS |
| ms-recursos | 0 | 16.7% (590/3537) | PASS |
| ms-zonas-riesgo | 0 | 57.0% (474/832) | PASS |

**Unitarias + integración:** 14 casos PASS documentados en [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md) (UT-01…UT-08, IT-01…IT-06).

**E2E manuales:** E2E-01…E2E-06 pendientes — se ejecutan al grabar [guion-video-plataforma-eva3.md](./guion-video-plataforma-eva3.md).

**Bug corregido en ejecución:** BUG-05 — mock `BrigadaBrigadistaRepository` en `RecursoServiceAsignarMultiTest`.

**Criterio cobertura ≥60% global:** no alcanzado en todos los módulos; paquetes de negocio críticos sí. Plan de mejora: tests MockMvc en controllers y ampliar `*ServiceTest`.

---

## 11. Riesgos y mitigación

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Cobertura < 60 % en algún módulo | Media | Priorizar tests en `service/` y `state/`; documentar exclusiones (DTOs, config) |
| Frontend sin Vitest | Alta | Cubrir UI con E2E manual; declarar deuda técnica en informe |
| Stack Docker caído en grabación | Media | Checklist pre-grabación; script reset |
| Tests flaky por H2/PostGIS | Baja | Perfil `test` dedicado; no depender de Docker en unit tests |

---

## 12. Cronograma de ejecución

| Fase | Actividad | Duración |
|------|-----------|----------|
| 1 | Inventariar tests existentes + completar matriz | 1 h |
| 2 | Ejecutar `mvn test` + JaCoCo en 4 módulos | 30 min |
| 3 | Capturar evidencias (consola + HTML) | 30 min |
| 4 | Ejecutar E2E manuales + capturas | 1 h |
| 5 | Redactar informe con bugs/mejoras | 2 h |
| 6 | Grabar video ejecución pruebas | 45 min |

---

## 13. Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Elaboró | Nicolás Barra | 2026-06-28 | |
| Revisó | Giannina Guerrero | | |
