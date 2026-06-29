# Registro de cambios — Segunda pasada de pruebas EVA3 (v2)

| Campo | Valor |
|-------|-------|
| **Versión** | 2.0 |
| **Fecha ejecución** | 2026-06-29 |
| **Comando** | `.\scripts\run-eva3-tests.ps1` |
| **Motivo** | Mejorar cobertura JaCoCo tras veredicto v1.0; ampliar casos negativos en services y seguridad BFF |
| **Referencia v1** | [plan-de-pruebas-eva3.md](./plan-de-pruebas-eva3.md) §10 · commit `cf16d5c` |

---

## 1. Comparativa de cobertura (instrucciones)

| Módulo | v1.0 (2026-06-28/29) | v2.0 (2026-06-29) | Δ | Veredicto v2 |
|--------|----------------------|-------------------|---|--------------|
| ms-incidentes | 29.9% | **41.8%** | +11.9 pp | Mejora; `state` 79.5%, `service` 33.3% |
| ms-zonas-riesgo | 57.0% | **69.7%** | +12.7 pp | **Cumple ≥60%** |
| ms-recursos | 16.7% | **22.3%** | +5.6 pp | Mejora parcial |
| bff-rev | 5.4% | **8.9%** | +3.5 pp | Mejora parcial; `security` 42.9% |

**Paquetes críticos destacados v2:**

| Paquete | v1 | v2 |
|---------|----|----|
| `incidentes.state` | 64.4% | 79.5% |
| `incidentes.service` | 16.8% | 33.3% |
| `zonas.service` | 58.7% | 83.6% |
| `recursos.service` | 16.3% | 22.4% |
| `bff.security` | ~0% | 42.9% |

---

## 2. Nuevos tests agregados (18 métodos)

| ID | Clase nueva / ampliada | Caso | Archivo |
|----|------------------------|------|---------|
| UT-09 | `IncidenteServiceTest` | Reporte público sin ubicación → `VALIDATION` | `ms-incidentes/.../IncidenteServiceTest.java` |
| UT-10 | `IncidenteServiceTest` | `crearPublico` con coords persiste y evalúa correlación | idem |
| UT-11 | `IncidenteServiceTest` | `obtener` incidente inexistente → `NOT_FOUND` | idem |
| UT-12 | `IncidenteServiceTest` | `transicionar` guarda historial en `TransicionEstado` | idem |
| UT-13 | `IncidenteServiceTest` | `timeline` incluye REGISTRO + TRANSICIONES | idem |
| UT-14 | `IncidentStateFactoryTest` | EN_PROGRESO → CONTROLADO / ESCALADO válidos | `IncidentStateFactoryTest.java` |
| UT-15 | `IncidentStateFactoryTest` | REPORTADO no salta directo a CONTROLADO | idem |
| UT-16 | `IncidentStateFactoryTest` | CONTROLADO solo permite CERRADO | idem |
| UT-17 | `RecursoServiceDespachoTest` | `desasignar` libera brigada y marca LIBERADA | `RecursoServiceDespachoTest.java` |
| UT-18 | `RecursoServiceDespachoTest` | ASIGNADA → EN_CAMINO válido | idem |
| UT-19 | `RecursoServiceDespachoTest` | Salto ASIGNADA → EN_INCIDENTE → `TRANSICION_INVALIDA` | idem |
| UT-20 | `ZonaServiceTest` | `consultarRiesgo` integra `WeatherDataPort` (Adapter) | `ZonaServiceTest.java` |
| UT-21 | `ZonaServiceTest` | `actualizar` zona existente | idem |
| UT-22 | `AuthorizationServiceTest` | `requireOperador` sin rol → Forbidden | `bff-rev/.../AuthorizationServiceTest.java` |
| UT-23 | `AuthorizationServiceTest` | `resolverPerfil` brigadista jefe con brigada | idem |
| UT-24 | `OperacionesFacadeServiceTest` | `crearZona` sin nombre → excepción | `OperacionesFacadeServiceTest.java` |
| UT-25 | `DashboardFacadeServiceTest` | `listarDashboards` sin incidentes → vacío | `DashboardFacadeServiceTest.java` |
| IT-07 | `IncidentStateFactoryTest` | Transiciones v2 en contexto Spring `@SpringBootTest` | `IncidentStateFactoryTest.java` |

**Resultado ejecución v2:** todos PASS (exit=0 en 4 módulos).

---

## 3. Bugs y hallazgos en v2

| ID | Detectado por | Descripción | Severidad | Acción |
|----|---------------|-------------|-----------|--------|
| — | — | No se detectaron regresiones ni bugs nuevos en producción | — | Suite v2 confirma reglas v1 |

**Nota:** v2 no modificó código de producción; solo amplió la suite de tests y documentación.

---

## 4. Deuda técnica remanente (v3 sugerida)

| Área | Cobertura actual | Próximo paso |
|------|------------------|--------------|
| Controllers (`*Controller`) | 0% en todos los MS | `@WebMvcTest` en endpoints críticos |
| bff-rev `service` | 9.4% | Tests `DespachoFacadeService`, `RecursosFacadeService` |
| ms-recursos global | 22.3% | Tests `liberarPorIncidente`, catálogo completo |
| ms-incidentes global | 41.8% | Más `CorrelacionService` + `FolioService` |
| Frontend React | Sin Vitest | E2E video plataforma |

---

## 5. Archivos de documentación actualizados en v2

- `matriz-de-pruebas-eva3.md` → versión 2.0
- `plan-de-pruebas-eva3.md` → §14 resultados v2
- `informe-pruebas-eva3.md` → versión 2.0
- `evidencias/resumen-ejecucion.txt` → ejecución 2026-06-29 03:39

---

## 6. Cómo reproducir v2

```powershell
git pull origin dev   # tras commit v2
.\scripts\run-eva3-tests.ps1
cd docs
npm run capture:jacoco-eva3
npm run build:eva3-pdfs
```
