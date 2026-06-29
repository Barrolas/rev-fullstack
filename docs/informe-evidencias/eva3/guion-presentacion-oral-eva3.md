# Guion presentación oral — EVA3 REV (15 minutos)

| Campo | Valor |
|-------|-------|
| **Proyecto** | REV — Red de Emergencia Valle |
| **Asignatura** | DSY1106 — Evaluación Parcial 3 |
| **Integrantes** | Nicolás Barra · Giannina Guerrero |
| **Formato** | PPT + videos (arquitectura, plataforma, pruebas) |
| **Duración** | 15 min + preguntas individuales |

> Reutilizar slides de [Presentacion-REV-EVA2-v5.pdf](../../Presentacion-REV-EVA2-v5.pdf) y agregar 4 diapositivas nuevas de pruebas (plantilla abajo).

---

## Distribución del tiempo

| Bloque | Quién | Slides | Tiempo | Indicador rúbrica |
|--------|-------|--------|--------|-------------------|
| Apertura | Ambos | 1 | 0:30 | — |
| Arquitectura resumida | Giannina | 2–4 | 2:30 | Ind. 5, 6 |
| Componentes + Eureka + seguridad | Giannina | 5–7 | 3:00 | Ind. 6, 7 |
| Plan y matriz de pruebas | Nicolás | 8–9 | 2:00 | Ind. 8 |
| Resultados + JaCoCo + bugs | Nicolás | 10–11 | 3:00 | Ind. 8 |
| Demo video pruebas | Nicolás | 12 | 1:30 | Ind. 8 |
| Integración / plataforma | Nicolás | 13 | 1:00 | Ind. 7 |
| Cierre | Ambos | 14 | 1:30 | Ind. 5–8 |

---

## Apertura conjunta (0:00 – 0:30) · Slide 1

**Nicolás:**
«Buenos días/tardes. Somos Nicolás Barra y Giannina Guerrero, sección 306-V. Presentamos la Evaluación Parcial 3 de **REV — Red de Emergencia Valle**: integración de microservicios con énfasis en pruebas unitarias, integración y end-to-end.»

**Giannina:**
«Mostraremos la arquitectura, la plataforma en uso y la evidencia de pruebas con casos negativos en flujos críticos del negocio municipal.»

---

## Bloque Giannina — Arquitectura (0:30 – 6:00)

### Slide 2 · Problemática (~0:45)

«Valle del Sol coordina emergencias con demanda impredecible. REV descompone el sistema en microservicios por dominio DDD: incidentes, zonas y recursos, más BFF y Gateway.»

### Slide 3 · Diagrama arquitectura (~1:00)

«React → Gateway JWT → BFF → tres microservicios → tres bases PostgreSQL. Eureka para discovery; Keycloak para identidad. Video de arquitectura detalla los 52 puntos del checklist.»

> **Si preguntan Ind. 5 (ideación):** «Partimos del caso municipal EVA1; técnicas de ideación: event storming simplificado por actores — despachador, brigadista, ciudadano — y derivamos bounded contexts.»

### Slide 4 · Microservicios (~0:45)

«ms-incidentes: ciclo de vida y correlación. ms-zonas-riesgo: PostGIS y clima adapter. ms-recursos: brigadas. Superamos el mínimo rúbrica BFF+2MS con BFF+3MS.»

### Slide 5 · Eureka (~0:45)

«Self-registration Spring Cloud. Lo bueno: sin hardcodear hosts. Lo malo: eventual consistency — mitigado con Circuit Breaker.»

### Slide 6 · Seguridad JWT (~1:00)

«Login vía keycloak-adapter; Gateway valida Bearer con AuthenticationFilter; roles DESPACHADOR/BRIGADISTA. Rutas `/api/public/**` para portal sin token.»

### Slide 7 · Patrones (~0:45)

«Factory+State en incidentes, Adapter en clima, Facade y Circuit Breaker en BFF, Repository JPA. Trazabilidad en `patrones-y-arquitectura-rev.md`.»

---

## Bloque Nicolás — Pruebas (6:00 – 12:30)

### Slide 8 · Plan de pruebas (~1:00)

«Estrategia en tres capas:

- **Unitarias** — JUnit 5 + Mockito en services y Factory.
- **Integración** — Spring Boot Test + H2; Facade BFF con clientes mockeados.
- **E2E manual** — curl seguridad + UI despacho y portal.

Mínimo tres de cada tipo en áreas críticas — docente. No solo camino feliz.»

### Slide 9 · Matriz resumida (~1:00)

Mostrar tabla 3×3:

| ID | Tipo | Área |
|----|------|------|
| UT-01 | Unit | Geo obligatoria EN_PROGRESO |
| UT-08 | Unit | Revertir correlación bloqueada |
| IT-04 | Integración | BFF reasignación + revertir |
| E2E-01 | E2E | Despacho brigada |
| E2E-02 | E2E | Portal → cola |
| E2E-03 | E2E | 401 sin JWT |

«Matriz completa en informe PDF.»

### Slide 10 · Resultados JaCoCo (~1:30)

«Ejecutamos `mvn test jacoco:report` en ms-incidentes, bff-rev, ms-recursos, ms-zonas-riesgo.

- ms-incidentes: _[X %]_ instrucciones
- bff-rev: _[X %]_
- Meta rúbrica: ≥ 60 %

Priorizamos paquetes `service`, `state`, `correlacion`. Frontend: E2E manual — Vitest planificado v2.»

> **Si preguntan Ind. 8:** «Factory+State permite testear cada transición aisladamente; si agregamos estado CERRADO_CON_CAUSA, solo nueva clase State + test.»

### Slide 11 · Bugs encontrados (~1:30)

| Bug | Prueba | Mejora |
|-----|--------|--------|
| Sin geo → EN_PROGRESO | UT-01 | Validación Factory |
| Doble asignación | UT-05 | ASIGNACION_DUPLICADA |
| Revertir con brigadas | UT-08 | Bloqueo BFF + reasignar |
| API abierta | E2E-03 | Filtro Gateway |

«Cada bug generó cambio en software documentado en informe §8.»

### Slide 12 · Video evidencia (~1:30)

«Reproducimos clip de 1–2 min del video ejecución pruebas: consola Maven PASS, JaCoCo, curl 401/200. Video completo disponible en entrega.»

*(Tener MP4 listo: `REV-video-ejecucion-pruebas-eva3.mp4`)*

---

## Bloque Nicolás — Plataforma (12:30 – 13:30) · Slide 13

«Video plataforma demuestra integración FE/BE: portal ciudadano en vivo, despacho, correlaciones, zonas PostGIS, recursos. Escalabilidad: MS independientes, Eureka, BD por servicio. Indicador 7 — funcionalidad y escalabilidad en un solo ecosistema.»

---

## Cierre conjunto (13:30 – 15:00) · Slide 14

**Giannina:**
«REV cumple arquitectura microservicios con persistencia JPA aislada, seguridad JWT y observabilidad. Reutilizamos informe arquitectura EVA2; el aporte EVA3 es el informe de pruebas con evidencia.»

**Nicolás:**
«Las pruebas en flujos críticos — estado, correlación, asignación, seguridad — alcanzan la cobertura exigida e incluyen casos negativos que mejoraron el software. Patrones de diseño hacen la suite mantenible al evolucionar el municipio.»

**Ambos:**
«Gracias. Quedamos atentos a sus preguntas.»

---

## Diapositivas nuevas a crear (EVA3)

| # | Título | Contenido |
|---|--------|-----------|
| 8 | Plan de pruebas EVA3 | Tipos, herramientas, áreas críticas |
| 9 | Matriz de pruebas | Tabla 6–9 filas resumidas |
| 10 | Cobertura JaCoCo | Captura dashboard + % por módulo |
| 11 | Bugs y mejoras | Tabla 4 filas |
| 12 | Evidencia en video | Screenshot terminal + QR/link opcional |

Slides 1–7: reutilizar EVA2 (problema, arquitectura, MS, patrones, seguridad).

---

## Banco de preguntas — preparación individual

### Indicador 5 — Ideación y microservicios

| Pregunta | Respuesta modelo |
|----------|------------------|
| ¿Por qué microservicios y no monolito? | Escalado por dominio, aislamiento de fallos, equipos independientes. |
| ¿Cómo dividieron dominios? | DDD: incidentes, territorio, logística — distintos ritmos de cambio. |
| ¿Qué técnica de ideación usaron? | Actores y casos de uso municipales desde EVA1; eventos críticos primeros 15 min. |

### Indicador 6 — Tecnologías

| Pregunta | Respuesta modelo |
|----------|------------------|
| ¿Cómo se comunican servicios? | REST síncrono, WebClient + `@LoadBalanced`, Eureka `lb://`. |
| ¿Por qué React + Spring Boot 4? | SPA reactiva para operador; ecosistema maduro Java 21 cloud. |
| ¿Por qué PostgreSQL separado? | Database-per-service; PostGIS solo donde aplica. |

### Indicador 7 — Integración y escalabilidad

| Pregunta | Respuesta modelo |
|----------|------------------|
| ¿Cómo escala ms-incidentes? | Réplicas detrás de Eureka; BD propia; sin redeploy de zonas. |
| ¿Qué pasa si cae zonas? | Circuit Breaker BFF → degraded + caché; despacho continúa. |
| ¿Frontend llama a MS directo? | No — solo Gateway/BFF; una llamada dashboard. |

### Indicador 8 — Pruebas (foco EVA3)

| Pregunta | Respuesta modelo |
|----------|------------------|
| ¿Dónde están las pruebas? | `src/test/java` por módulo; ver matriz EVA3. |
| ¿Cobertura alcanzada? | JaCoCo ≥ 60 % en ms-incidentes y bff-rev; reporte HTML en target/site/jacoco. |
| ¿Ejemplo caso negativo? | UT-01: sin lat/lng → excepción al pasar EN_PROGRESO. |
| ¿Pruebas integración vs unitarias? | Unit: mocks; integración: contexto Spring o Facade con clientes simulados. |
| ¿E2E automatizado? | Manual con curl + UI; evidencia en video; Playwright planificado. |
| ¿Cómo mejoran patrones la mantenibilidad? | Factory: test por estado; Facade: test orquestación sin levantar todos los MS. |
| ¿Bug que encontraron probando? | Revertir correlación con brigadas activas → CorrelacionBloqueadaException. |

---

## Videos a tener listos

| Video | Responsable | Archivo |
|-------|-------------|---------|
| Arquitectura | Giannina | `REV-video-arquitectura-eva3.mp4` |
| Plataforma | Nicolás | `REV-video-plataforma-eva3.mp4` |
| Ejecución pruebas | Nicolás | `REV-video-ejecucion-pruebas-eva3.mp4` |

---

## Referencias

- [guion-defensa-oral-eva2.md](../../guion-defensa-oral-eva2.md)
- [eva3-fullstack-rubrica.md](./eva3-fullstack-rubrica.md)
- [informe-pruebas-eva3.md](./informe-pruebas-eva3.md)
