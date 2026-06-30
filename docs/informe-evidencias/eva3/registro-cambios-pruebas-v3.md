# Registro de cambios — Tercera pasada de pruebas EVA3 (v3)

| Campo | Valor |
|-------|-------|
| **Versión** | 3.0 |
| **Fecha ejecución** | 2026-06-29 |
| **Comando** | `.\scripts\run-eva3-tests.ps1` |
| **Motivo** | Alcanzar ≥80 % JaCoCo en los 4 módulos; ampliar WebMvc, integración y facades BFF |
| **Referencia v2** | [registro-cambios-pruebas-v2.md](./registro-cambios-pruebas-v2.md) · commit `5d57ff8` |

---

## 1. Comparativa de cobertura (instrucciones, capas críticas JaCoCo `<includes>`)

| Módulo | v2.0 | v3.0 | Δ | Veredicto v3 |
|--------|------|------|---|--------------|
| ms-incidentes | 41.8% | **89.4%** | +47.6 pp | **Cumple ≥80%** |
| ms-zonas-riesgo | 69.7% | **88.2%** | +18.5 pp | **Cumple ≥80%** |
| ms-recursos | 22.3% | **83.6%** | +61.3 pp | **Cumple ≥80%** |
| bff-rev | 8.9% | **80.2%** | +71.3 pp | **Cumple ≥80%** |

**Paquetes críticos v3:**

| Paquete | v3 |
|---------|-----|
| `incidentes.service` | 92.0% |
| `incidentes.correlacion` | 90.6% |
| `incidentes.controller` | 66.3% |
| `recursos.service` | 85.0% |
| `zonas.service` | 83.6% |
| `bff.service` | 78.2% |
| `bff.security` | 93.2% |
| `bff.controller` | 81.6% |

**Configuración JaCoCo v3:** `<includes>` en parent y módulos (service, controller, state, correlacion, security, adapter, util). Excluye DTOs, entities, config y Application del bundle medido.

---

## 2. Suite ampliada (v3)

| Área | Tests v3 (aprox.) | Archivos nuevos / ampliados |
|------|-------------------|----------------------------|
| ms-incidentes | 78 | `IncidenteServiceTest`, `CorrelacionServiceTest`, `ZonaAsignacionServiceTest`, `AdjuntoServiceTest`, `FolioServiceTest`, `*ControllerWebMvcTest` |
| ms-recursos | 72 | `RecursoServiceListadosTest`, `RecursoServiceDespachoTest`, `RecursoServiceIntegrationTest`, `RecursoControllerWebMvcTest` |
| ms-zonas-riesgo | 28 | `ZonaServiceIntegrationTest`, `FakeWeatherAdapterTest`, `ZonaControllerWebMvcTest`, `ZonaGeometryUtilTest` |
| bff-rev | 139 | Facades, `AuthorizationServiceTest`, controllers WebMvc, `TurnstileServiceTest`, `NominatimGeocodingServiceTest` |
| **Total automatizados** | **317** | 0 failures, 0 errors |

---

## 3. Resultado ejecución v3

```
.\scripts\run-eva3-tests.ps1  → exit=0 en 4 módulos
Fecha: 2026-06-29 20:16:00
Evidencia: evidencias/resumen-ejecucion.txt
```

---

## 4. Documentación y entregables v3

- Presentación arquitectura EVA3: `Presentacion-REV-EVA3.pdf` (Giannina Guerrero)
- Guion arquitectura actualizado: `guion-video-arquitectura-eva3.md`
- Colección Postman BFF: `docs/api/REV-EVA3-BFF.postman_collection.json`
- Script captura E2E curl: `scripts/capture-e2e-curl-eva3.ps1`

---

## 5. Deuda remanente

| Área | Nota |
|------|------|
| Controllers MS (incidentes/recursos) | Bundle global ≥80%; controllers aislados ~52–66% |
| Frontend Vitest | Sin suite; E2E manual en video plataforma |
| E2E curl PNG | Ejecutar `capture-e2e-curl-eva3.ps1` con Gateway UP |

---

## 6. Cómo reproducir v3

```powershell
git pull origin dev
.\scripts\run-eva3-tests.ps1
cd docs
npm run capture:jacoco-eva3
npm run build:eva3-pdfs
# E2E seguridad (requiere stack):
.\scripts\dev-up.ps1 -DockerApps
.\scripts\capture-e2e-curl-eva3.ps1
```
