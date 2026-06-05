# Guión defensa oral EVA2 — REV (15 minutos)

**Proyecto:** Red de Emergencia Valle (REV)  
**Asignatura:** DSY1106 — Desarrollo Fullstack III  
**Integrantes:** Nicolás Barra · Giannina Guerrero  
**Base:** presentación *Presentación Proyecto REV - DSY1106* (≈29 diapositivas) + [eva2-fullstack-rubrica.md](./eva2-fullstack-rubrica.md)

---

## Distribución del tiempo

| Bloque | Quién | Slides | Tiempo | Enfoque rúbrica |
|--------|-------|--------|--------|-----------------|
| Apertura | **Ambos** | 1 | 0:30 | Contexto |
| Bloque 1 | **Nicolás** | 2–8 | 3:30 | Arquitectura + MS + infra (Ind. 2 y 6) |
| Bloque 2 | **Nicolás** | 9–12 | 2:30 | Patrones arq., diseño, arquetipos, DDD (Ind. 1, 2, 5, 6) |
| Bloque 3 | **Giannina** | 13–17 | 3:00 | Frontend, portal, UX, roles (Ind. 1 y 5 FE) |
| Bloque 4 | **Giannina** | 18–21 | 2:00 | Seguridad, resiliencia, persistencia, observabilidad |
| Bloque 5 | **Nicolás** | 22–23 | 1:30 | Git + trazabilidad (Ind. 3 y 7) |
| Bloque 6 | **Giannina** | 24–26 | 1:30 | Tecnologías, flujo, resultados |
| Cierre | **Ambos** | 27–29 | 1:30 | Conclusiones + cierre (Ind. 8) |

**Total: ~15:00** — practicar con cronómetro; si se atrasan, acortar slides 15 (capturas) y 24 (tecnologías).

---

## Apertura conjunta (0:00 – 0:30) · Slide 1

**Nicolás:**  
«Buenos días/tardes, profesor/a. Somos Nicolás Barra y Giannina Guerrero, sección 306-V. Presentamos **REV — Red de Emergencia Valle**, la plataforma que desarrollamos para la Municipalidad de Valle del Sol en la Evaluación Parcial 2.»

**Giannina:**  
«REV conecta despacho, territorio y comunidad en una arquitectura cloud-native. En 15 minutos mostraremos el problema que resolvemos, la arquitectura, los patrones que implementamos y cómo trabajamos en equipo con Git. Nicolás comienza con la visión técnica del backend; yo continúo con la experiencia de usuario y el cierre operacional.»

---

## Bloque 1 — Nicolás (0:30 – 4:00)

### Slide 2 · Plataforma REV — valor operacional (~0:40)

«REV no es solo un proyecto académico: es una respuesta a un problema real de gestión de emergencias. En un solo ecosistema entregamos despacho unificado, perímetro seguro con Gateway y Keycloak, resiliencia con Circuit Breaker, portal ciudadano 24/7, mapa territorial con PostGIS y un stack reproducible con Docker. La propuesta de valor es simple: **conectar sala de despacho, terreno y comunidad** sin que un pico de crisis tumbe todo el sistema.»

### Slide 3 · Problema identificado (~0:45)

«Valle del Sol debe coordinar incendios, incidentes urbanos y alertas vecinales con demanda impredecible. Un monolito falla en tres frentes: acoplamiento — un error detiene todo; escalado uniforme — no prioriza lo crítico; interfaces fragmentadas — el despachador pierde tiempo; y canales ciudadanos lentos — se retrasa la activación de brigadas. Los primeros quince minutos definen el alcance de una emergencia. REV propone **escalar por dominio de negocio**, no por capa técnica genérica.»

> **Si preguntan:** *«¿Qué pasa si cae un servicio?»* → «No cae todo el despacho: el BFF activa Circuit Breaker y la UI muestra modo `degraded` con datos en caché.»

### Slide 4 · Objetivos (~0:35)

«Cada objetivo del proyecto tiene un componente concreto. Gestión de incidentes → `ms-incidentes` con Factory y State. Riesgo territorial → `ms-zonas-riesgo` con PostGIS. Logística → `ms-recursos`. Vista unificada → BFF con `DashboardFacadeService`. Canal ciudadano → portal `/portal` sin registro. La rúbrica pide BFF más dos microservicios: nosotros entregamos **BFF + tres MS + arquetipo Maven**.»

### Slide 5 · Visión general (~0:40)

«Cuatro actores: despachador, brigadista, administrador y ciudadano. Tres dominios con **base de datos propia** — sin BD compartida. El BFF compone en una sola llamada el `DashboardResponse`: incidente, riesgo, recursos y flag `degraded`. El frontend nunca llama a tres microservicios por separado; eso es decisión arquitectónica deliberada.»

> **Si preguntan:** *«¿Por qué separar recursos de incidentes?»* → «Distinto ritmo de cambio, equipos distintos y escalado independiente — principio DDD.»

### Slide 6 · Arquitectura general (~0:40)

«Recorremos las capas: cliente React → API Gateway en el puerto 8080 → BFF → tres microservicios → tres bases de datos. Eureka resuelve `lb://` sin hardcodear hosts. Keycloak valida JWT en el perímetro. Un solo punto de entrada para operadores y ciudadanos.»

### Slide 7 · Microservicios (~0:45)

«Tres microservicios, tres puertos, tres esquemas: `ms-incidentes` 8081, `ms-zonas-riesgo` 8082 con PostGIS, `ms-recursos` 8083. Cada uno tiene Flyway, Actuator, OpenAPI y cliente Eureka. La separación es deliberada: las reglas de incidentes evolucionan sin redesplegar zonas ni logística.»

### Slide 8 · Infraestructura (~0:35)

«Doce servicios en Docker Compose: bases, IAM, discovery, apps Java. Eureka en 8761, Keycloak realm `rev`, Spring Boot Admin en 8099. Arranque reproducible con `.\scripts\dev-up.ps1`. Esto nos permite demostrar el sistema en taller o en defensa sin depender de configuraciones manuales.»

---

## Bloque 2 — Nicolás (4:00 – 6:30)

### Slide 9 · Patrones arquitectónicos (~0:40)

«Distinguimos patrón **arquitectónico** del patrón de **diseño**. Aquí: microservicios, API Gateway, BFF, Service Discovery, Circuit Breaker y database-per-service. El Gateway centraliza seguridad; el BFF reduce latencia del dashboard; Resilience4j permite operación parcial; y `ZonaRiesgoCache` implementa cache-aside cuando zonas no responde.»

> **Si preguntan:** *«¿Hay endpoints públicos sin JWT?»* → «Sí, `/api/public/**` para el portal ciudadano; está explícito en la configuración del Gateway.»

### Slide 10 · Patrones de diseño backend (~0:50)

«Aquí cumplimos el indicador de la rúbrica con patrones trazables a clases Java. **Factory + State** en `IncidentStateFactory`: por ejemplo, `ReportadoState` exige georreferenciación para pasar a `EN_PROGRESO`. **Adapter** en `FakeWeatherAdapter` sobre `WeatherDataPort`. **Facade** en `DashboardFacadeService`. **Repository** con Spring Data JPA. Cada patrón resuelve un problema concreto de mantenibilidad.»

> **Si preguntan:** *«¿FakeWeather es un hack?»* → «No; es un adaptador consciente para la demo. El puerto permite conectar IoT o API real sin tocar el dominio.»

### Slide 11 · Arquetipos (~0:35)

«Tenemos un **arquetipo Maven custom** en `archetypes/rev-microservice-archetype`. Estandariza Controller, Service, Repository, Flyway, Eureka y Actuator. Los tres MS actuales replican esa estructura; el arquetipo permite generar un cuarto servicio municipal con `mvn archetype:generate`.»

### Slide 12 · DDD y Bounded Contexts (~0:35)

«Tres bounded contexts: incidentes, zonas y recursos. El BFF actúa como **capa anticorrupción**: traduce tres modelos a un `DashboardResponse` que entiende React. `incidente_id` es UUID sin FK entre bases — integración eventual típica en microservicios. No es DDD táctico completo, pero sí separación de contextos verificable en código y despliegue.»

**Nicolás:** «Ahora Giannina les muestra cómo esto se vive desde el frontend y la operación diaria.»

---

## Bloque 3 — Giannina (6:30 – 9:30)

### Slide 13 · Frontend y UX (~0:45)

«El dashboard es una SPA React con TypeScript y Vite. Módulos claros: Inicio con KPIs, Despacho como tabla operacional, Incidentes, Zonas con mapa Leaflet, Recursos y Portal público. Aplicamos patrones de diseño en frontend: **Provider** en los contextos, **Custom Hooks** como `useApiQuery` y `useAuth`, **Facade** en `api.ts`, **Observer** con `incidentCreatedTick` y **Composite** en `ModuleHub`. El frontend consume el BFF, no los microservicios directamente.»

> **Si preguntan:** *«¿Por qué no llaman a los tres MS?»* → «El BFF ya agrega y protege con Circuit Breaker. Menos latencia, cliente más simple, reglas en el backend.»

### Slide 14 · Reporte público (~0:40)

«El ciudadano reporta sin registro: Portal → Gateway → `ms-incidentes` → estado `REPORTADO` con georreferencia. En segundos el despacho ve el incidente. Es el canal vecinal sin fricción que la rúbrica pide como componente frontend con impacto real en el negocio.»

### Slide 15 · Capturas operativas (~0:25) — *acortar si van tarde*

«Estas capturas muestran el sistema en operación: login, despacho, incidentes, zonas y portal. No son mockups: son pantallas del `rev-dashboard` contra el backend levantado con Docker.»

### Slide 16 · Design System (~0:35)

«Paleta oscura para reducir fatiga en sala de despacho, naranja como único acento, tipografía Inter, componentes como `KpiCard`, `DegradedAlert` y CSS por módulo. El diseño no es decorativo: soporta misión crítica con jerarquía visual clara.»

### Slide 17 · Roles y permisos (~0:35)

«Keycloak realm `rev` con roles Despachador, Brigadista y Administrador. En frontend, `useAuth` y `ProtectedLayout` controlan rutas y acciones — por ejemplo, no todos pueden crear incidentes. Seguridad en perímetro y en UI.»

**Giannina:** «Vuelvo con Nicolás un momento para Git; antes cierro seguridad y datos.»

---

## Bloque 4 — Giannina (9:30 – 11:30)

### Slide 18 · Seguridad (~0:30)

«JWT validado en el Gateway con adapter Keycloak. Rutas `/api/**` protegidas; canal público acotado. El perímetro es único: el frontend no implementa lógica de seguridad, solo presenta tokens y roles.»

### Slide 19 · Resiliencia (~0:35)

«Resilience4j en el BFF: si `ms-zonas-riesgo` falla, el dashboard sigue con datos cacheados y el flag `degraded`. En UI, `DegradedAlert` informa al operador. La municipalidad puede seguir despachando con información parcial — eso es continuidad operacional.»

### Slide 20 · Persistencia (~0:35)

«Tres bases aisladas: `rev_incidentes`, `rev_zonas` con PostGIS, `rev_recursos`. Flyway versiona esquemas; `ddl-auto=validate` en producción. Sin FK cruzadas entre servicios — coherencia vía APIs y UUID.»

### Slide 21 · Observabilidad (~0:30)

«Actuator en cada MS, Spring Boot Admin centralizado, logs estructurados. Permite ver salud del ecosistema durante la demo y en operación municipal.»

---

## Bloque 5 — Nicolás (11:30 – 13:00)

### Slide 22 · Estrategia Git (~0:45)

«Trabajamos con GitFlow simplificado: `main` para release, `dev` para integración, ramas `feature/*` y `fix/*` para trabajo diario. Commits atómicos con formato `[ TIPO ]:`. Ejemplos: `feature/public-report-incidente-login`, `feature/ms-incidentes-correlacion-backend`. Todo documentado en `CONTRIBUTING.md` y `estrategia-ramas-commits-eva2.md`. Los merges a `dev` nos permitieron integrar portal, correlaciones y recursos sin perder trazabilidad.»

> **Si preguntan:** *«¿Tuvieron conflictos?»* → «Sí, típicamente en `package.json`, rutas del BFF o migraciones Flyway. Los resolvemos en la rama feature antes del merge a `dev`, revisando diff y ejecutando tests.»

### Slide 23 · Trazabilidad técnica (~0:45)

«Cada decisión tiene evidencia: Factory en `ms-incidentes`, Adapter en zonas, Facade y Circuit Breaker en BFF, tests en Factory y BFF, Docker Compose para despliegue. La matriz completa está en `patrones-y-arquitectura-rev.md` con más de veinte ítems patrón → código.»

> **Si preguntan sobre pruebas (Ind. 8):** «Ejecutamos `mvn test` en `ms-incidentes` y `bff-rev`. Hay tests de `IncidentStateFactory`, correlación y zonas. Reportes JaCoCo en `target/site/jacoco/`.»

---

## Bloque 6 — Giannina (13:00 – 14:30)

### Slide 24 · Tecnologías (~0:30)

«Stack elegido por madurez y alineación curricular: React 18, Java 21, Spring Boot 4, Spring Cloud, PostgreSQL 16, PostGIS, Keycloak, Resilience4j. Criterio: ecosistema enterprise, comunidad activa y capacidad de demostrar patrones del curso.»

### Slide 25 · Flujo funcional (~0:35)

«Flujo de punta a punta: ciudadano reporta → incidente `REPORTADO` → despachador ve dashboard enriquecido → asigna brigada desde recursos → mapa muestra riesgo territorial. Un solo relato operacional que conecta todos los componentes del encargo.»

### Slide 26 · Resultados (~0:35)

«Resultados técnicos: monorepo con BFF + 3 MS, seis o más patrones trazables, Circuit Breaker operativo. Operacionales: dashboard unificado, portal ciudadano, mapa en vivo. Beneficio municipal: coordinación más rápida y canal vecinal directo.»

---

## Cierre conjunto (14:30 – 15:00)

### Slide 27 · Conclusiones — **Nicolás** (~0:25)

«Concluimos que REV cumple el encargo EVA2: patrones de diseño justificados, arquitectura microservicios coherente, branching documentado y pruebas en módulos críticos. El sistema es demostrable, versionado en GitHub y alineado al caso municipal de la EVA1.»

### Slide 28 · Evolución futura — **Giannina** (~0:20)

«Como visión — no como compromiso de entrega — vemos app móvil, integración IoT y madurez de observabilidad. El roadmap está en la documentación; hoy el foco es la plataforma operativa entregada.»

### Slide 29 · Cierre — **Ambos** (~0:25)

**Giannina:** «REV integra despacho, territorio y comunidad.»  
**Nicolás:** «Listos para demo en vivo: Eureka, dashboard y código abierto en el repositorio.»  
**Ambos:** «Muchas gracias. Quedamos atentos a sus preguntas.»

---

## Banco de preguntas por integrante (defensa individual)

### Nicolás — priorizar Ind. 5 backend, 6, 7 y 8

| Pregunta probable | Respuesta modelo |
|-------------------|------------------|
| ¿Qué patrones de diseño implementaron en backend? | Factory+State en incidentes, Adapter en clima, Facade y Circuit Breaker en BFF, Repository en JPA. Cada uno resuelve mantenibilidad o resiliencia. |
| ¿Por qué microservicios y no monolito? | Picos heterogéneos en crisis, despliegue independiente por dominio, fallas contenidas. |
| ¿Cómo se comunican los MS? | REST síncrono vía WebClient en BFF; nombres Eureka `MS-INCIDENTES`, etc. |
| ¿Qué es el arquetipo Maven? | Plantilla en `archetypes/` para generar nuevos MS con capas y dependencias estándar. |
| ¿Cómo funciona el branching? | `feature/*` → PR → `dev` → `main`; commits `[ FEAT ]`, `[ FIX ]`, `[ DOCS ]`. |
| ¿Ejemplo de conflicto Git? | Migraciones Flyway o rutas del Gateway; se resuelve en la rama antes del merge. |
| ¿Dónde están las pruebas? | `mvn test` en `ms-incidentes` y `bff-rev`; JaCoCo en `target/site/jacoco/`. |
| ¿Es DDD completo? | Bounded contexts sí; agregados simplificados; mejora futura carpeta `domain/` explícita. |

### Giannina — priorizar Ind. 5 frontend, 6 (vista UI), 8

| Pregunta probable | Respuesta modelo |
|-------------------|------------------|
| ¿Qué patrones hay en el frontend? | Provider, Custom Hooks, Facade en `api.ts`, Observer con `incidentCreatedTick`, Composite en `ModuleHub`. |
| ¿Dónde está el Observer? | Al crear incidente, `notifyIncidentCreated()`; páginas suscritas hacen `refetch()`. |
| ¿Qué aporta `useApiQuery`? | Unifica loading, error y refetch; evita duplicar try/catch. |
| ¿Cómo se ve la resiliencia en UI? | Flag `degraded` + componente `DegradedAlert`. |
| ¿Quién puede crear incidentes? | Solo roles con `canManageIncidents` en `useAuth` — Admin y Despachador. |
| ¿El portal es seguro sin login? | Sí, canal público acotado; solo `POST` de reporte, sin acceso al despacho. |
| ¿Gap UI/backend? | Transición de estados completa en backend; UI aún visualiza — documentado en informe. |

---

## Demo en vivo (si el docente la pide)

| Orden | Quién | Acción |
|-------|-------|--------|
| 1 | Nicolás | Abrir `IncidentStateFactory.java` + un `*State.java` |
| 2 | Nicolás | Mostrar `DashboardFacadeService` y `@CircuitBreaker` |
| 3 | Giannina | Abrir `api.ts` + `UiContext.tsx` (Observer) |
| 4 | Giannina | Navegar: Login → Despacho → Portal reporte |
| 5 | Nicolás | `docker compose ps` o Eureka `:8761` |

---

## Tips finales

1. **No lean las diapositivas** — expliquen el *por qué* de cada decisión (eso puntúa la rúbrica oral).
2. **Si no saben algo** — «Está documentado en el informe / es mejora futura» mejor que inventar.
3. **Repitan el hilo conductor:** problema → arquitectura → patrones → demo → Git → resultados.
4. **Practiquen el pase:** Nicolás entrega a Giannina en slide 12; Giannina devuelve a Nicolás en slide 21 para Git.

---

## Referencias

| Documento | Uso en defensa |
|-----------|----------------|
| [patrones-y-arquitectura-rev.md](./patrones-y-arquitectura-rev.md) | Matriz patrón → código, respuestas modelo |
| [informe-sistema-rev.md](./informe-sistema-rev.md) | Funcionalidades y gaps documentados |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branching y commits |
| [estrategia-ramas-commits-eva2.md](./estrategia-ramas-commits-eva2.md) | Historial de ramas EVA2 |
| [guia-entorno-local.md](./guia-entorno-local.md) | Arranque para demo en vivo |
| [Presentacion-REV-EVA2-v5.pdf](./Presentacion-REV-EVA2-v5.pdf) | Diapositivas de la exposición |
