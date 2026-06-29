# Guion video ejecución de pruebas — EVA3 REV

| Campo | Valor |
|-------|-------|
| **Responsable grabación** | Nicolás Barra |
| **Formato** | Terminal + IDE + navegador + voz |
| **Duración objetivo** | 5–7 minutos |
| **Uso** | Evidencia para defensa oral (indicador 8) y presentación PPT |
| **Referencia** | [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md) |

---

## Objetivo del video

Demostrar que las pruebas **unitarias**, de **integración** y **end-to-end** fueron ejecutadas realmente, mostrando:

1. Comandos Maven y resultados PASS.
2. Reportes JaCoCo con métricas de cobertura.
3. Casos negativos (no solo camino feliz).
4. Escenarios E2E manuales (curl + UI).
5. Bugs detectados y mejoras aplicadas.

---

## Preparación

```powershell
# Stack para E2E (opcional si ya UP)
.\scripts\dev-up.ps1 -DockerApps

# Terminal 1 — raíz repo
cd businessdomain\ms-incidentes
```

| Ventana | Contenido |
|---------|-----------|
| Terminal | PowerShell en ms-incidentes |
| IDE | Tests abiertos: `IncidentStateFactoryTest`, `CorrelacionFacadeServiceTest` |
| Navegador | Pestaña JaCoCo (generar antes) + pestaña login REV |

---

## Escena 1 — Introducción (0:00 – 0:20)

**Pantalla:** `matriz-de-pruebas-eva3.md` o slide «Plan de pruebas REV»

**Narración:**
«En REV aplicamos pruebas en los flujos críticos del negocio: transiciones de incidente, correlación, asignación de brigadas y seguridad JWT. Esta grabación evidencia la ejecución según nuestra matriz de pruebas EVA3 — unitarias, integración y end-to-end, incluyendo casos negativos.»

---

## Escena 2 — Tests unitarios ms-incidentes (0:20 – 1:30)

**Pantalla:** Terminal

**Comando:**
```powershell
cd businessdomain\ms-incidentes
..\..\mvnw.cmd test -Dtest=IncidentStateFactoryTest,CorrelacionServiceTest
```

**Narración mientras corre:**
«Ejecutamos tests unitarios con JUnit 5 y Mockito. `IncidentStateFactoryTest` valida el patrón Factory+State: un incidente sin georreferenciación **no** puede pasar a EN_PROGRESO — caso negativo crítico para el despacho.»

**Al terminar — señalar consola:**
«Tests run: X, Failures: 0. PASS.»

**Pantalla:** IDE → `IncidentStateFactoryTest.enProgresoRequiereGeorreferenciacion`

**Narración:**
«Este test detectó la necesidad de validar coordenadas antes de enviar brigadas a terreno — regla de negocio encapsulada en el Factory.»

**Pantalla:** IDE → `CorrelacionServiceTest.revertir_fallaSiNoEstaConfirmada`

**Narración:**
«Caso negativo de correlación: revertir una sugerencia pendiente lanza BusinessRuleException — solo correlaciones confirmadas son reversibles.»

---

## Escena 3 — JaCoCo cobertura ms-incidentes (1:30 – 2:15)

**Comando (si no generó reporte):**
```powershell
..\..\mvnw.cmd jacoco:report
start target\site\jacoco\index.html
```

**Pantalla:** JaCoCo HTML — paquetes `state`, `service`, `correlacion`

**Narración:**
«JaCoCo mide cobertura de instrucciones y branches. Priorizamos paquetes con lógica de negocio. La rúbrica EVA3 exige mínimo 60 % — aquí vemos el porcentaje por paquete. [Leer % en voz]. Los DTOs y configuración tienen menor peso en la métrica.»

**Acción:** Captura pantalla para informe PDF.

---

## Escena 4 — Tests BFF integración (2:15 – 3:00)

**Comando:**
```powershell
cd ..\..\infraestructuredomain\bff-rev
..\..\mvnw.cmd test -Dtest=CorrelacionFacadeServiceTest
```

**Pantalla:** IDE → `CorrelacionFacadeServiceTest.previewRevertir_marcaBloqueadoConAsignacionesActivas`

**Narración:**
«Prueba de integración lógica en el BFF — Facade pattern. Si el incidente canónico tiene brigadas activas, revertir correlación lanza CorrelacionBloqueadaException. Esto evitó inconsistencia operativa detectada en pruebas manuales.»

**Pantalla:** Test `revertir_conReasignacion_transfiereYRevertir`

**Narración:**
«Camino alternativo: con reasignación explícita, el BFF primero transfiere asignaciones a ms-recursos y luego revierte en ms-incidentes — orquestación multi-servicio.»

---

## Escena 5 — E2E seguridad curl (3:00 – 3:45)

**Pantalla:** Terminal

**Comando 1 — sin token (E2E-03):**
```powershell
curl.exe -s -w "\nHTTP:%{http_code}" "http://localhost:18080/api/incidentes"
```

**Narración:**
«End-to-end de seguridad: petición al Gateway sin header Authorization. Esperamos HTTP 401 Unauthorized — el perímetro JWT funciona.»

**Comando 2 — con login (E2E-04):**
```powershell
curl.exe -s -X POST "http://localhost:18080/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=despachador&password=rev123"
```

**Narración:**
«Login exitoso retorna access_token. Con Bearer token, el mismo endpoint responde 200 y JSON de incidentes.»

*(Pegar token en segundo curl — preparar token en notepad antes para no perder tiempo)*

```powershell
curl.exe -s -w "\nHTTP:%{http_code}" "http://localhost:18080/api/incidentes" -H "Authorization: Bearer <TOKEN>"
```

---

## Escena 6 — E2E UI despacho (3:45 – 5:00)

**Pantalla:** Navegador REV — `/despacho/operacion`

**Narración:**
«Prueba end-to-end operacional: login despachador, seleccionar incidente en cola, asignar brigada MUN-REFUERZO, confirmar despacho rápido. Verificamos en Activos en terreno — E2E-01 de la matriz.»

**Acciones rápidas (30–45 s si ya sembrado):**
1. Mostrar cola con incidentes.
2. Asignar brigada.
3. Pestaña Activos.

**Narración cierre escena:**
«El flujo completo frontend → Gateway → BFF → ms-recursos → ms-incidentes funciona sin errores en consola.»

---

## Escena 7 — Tabla bugs y mejoras (5:00 – 5:40)

**Pantalla:** `informe-pruebas-eva3.md` §8 o slide tabla

**Narración:**
«Resumen de hallazgos por pruebas:

| Bug | Prueba | Fix |
|-----|--------|-----|
| EN_PROGRESO sin geo | UT-01 | IncidentStateFactory |
| Asignación duplicada | UT-05 | ASIGNACION_DUPLICADA |
| Revertir con brigadas | UT-08 | CorrelacionBloqueadaException |
| API sin token | E2E-03 | AuthenticationFilter |

Las pruebas no solo validaron el camino feliz — encontraron reglas de negocio faltantes y las corrigieron.»

---

## Escena 8 — Cierre (5:40 – 6:10)

**Pantalla:** JaCoCo resumen o matriz completa

**Narración:**
«Ejecutamos [N] tests automatizados en cuatro módulos Java más seis escenarios E2E manuales. Cobertura JaCoCo en módulos críticos cumple la meta del 60 %. Patrones Factory, Facade y Adapter facilitan mantener estas pruebas al evolucionar REV. Informe completo y matriz en `docs/informe-evidencias/eva3/`.»

---

## Comandos adicionales (opcional si hay tiempo)

```powershell
# ms-recursos — asignación duplicada
cd businessdomain\ms-recursos
..\..\mvnw.cmd test -Dtest=RecursoServiceAsignarMultiTest jacoco:report

# ms-zonas — validación nivel riesgo
cd ..\ms-zonas-riesgo
..\..\mvnw.cmd test -Dtest=ZonaServiceTest jacoco:report
```

---

## Checklist grabación

- [ ] Maven test PASS visible en consola
- [ ] JaCoCo HTML abierto con % legible
- [ ] Al menos 1 caso negativo explicado
- [ ] curl 401 sin token
- [ ] curl 200 con token
- [ ] UI despacho mostrada
- [ ] Tabla bugs mencionada
- [ ] Duración ≤ 7 min

---

## Evidencias a guardar

Copiar a `docs/informe-evidencias/eva3/evidencias/`:

- `jacoco-ms-incidentes.png`
- `mvn-test-incidentes.png`
- `curl-401.png`
- `curl-200.png`
- Frame video despacho (opcional)

---

## Archivo sugerido

`REV-video-ejecucion-pruebas-eva3.mp4`
