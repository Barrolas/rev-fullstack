# Guion video arquitectura — EVA3 REV

| Campo | Valor |
|-------|-------|
| **Responsable grabación** | Giannina Guerrero |
| **Formato** | Pantalla + voz en off (IDE, navegador, diapositivas) |
| **Duración objetivo** | 18–22 minutos |
| **Checklist** | 52 ítems — Video de Arquitectura |
| **Apoyo visual** | `docs/Presentacion-REV-EVA2-v5.pdf` slides 2–12, 18–21 |

> Marca **✓** en el checklist Excel al grabar cada ítem. Responde **«listo»** al asistente IA si grabas asistida.

---

## 0. Preparación (antes de grabar)

### 0.1 Entorno

```powershell
cd rev-fullstack
.\scripts\dev-up.ps1 -DockerApps -Build
```

| Verificación | URL / acción |
|--------------|--------------|
| Eureka UP | http://localhost:18761 |
| Spring Boot Admin | http://localhost:18099 |
| Gateway responde | http://localhost:18080 |
| IDE abierto | Raíz monorepo `rev-fullstack` |

### 0.2 Pestañas del navegador

1. Eureka `18761`
2. Spring Boot Admin `18099`
3. (Opcional) Swagger ms-incidentes vía Gateway

### 0.3 Archivos abiertos en IDE (orden sugerido)

1. `docs/patrones-y-arquitectura-rev.md`
2. `infraestructuredomain/eureka-server/src/main/resources/application.properties`
3. `businessdomain/ms-incidentes/` (árbol)
4. `infraestructuredomain/api-gateway/src/main/java/.../AuthenticationFilter.java`
5. `infraestructuredomain/keycloak-adapter/.../AuthController.java`
6. `frontend/rev-dashboard/src/api.ts`

### 0.4 Diapositivas

Tener abiertas slides **2, 3, 5, 6, 7, 9, 18, 19** de `Presentacion-REV-EVA2-v5.pdf`.

---

## Mapa de bloques

| Bloque | Tiempo | Checklist | Pantalla |
|--------|--------|-----------|----------|
| A — Contexto y diseño | 0:00–2:00 | 1–4 | Diapositiva + diagrama |
| B — Service Discovery | 2:00–5:00 | 5–11 | IDE + Eureka |
| C — Microservicios (general) | 5:00–12:00 | 12–30 | IDE ms-incidentes, zonas, recursos, bff |
| D — Seguridad JWT | 12:00–15:00 | 31–35 | Gateway + adapter |
| E — API Gateway | 15:00–17:00 | 36–38 | Gateway config |
| F — Monitoreo | 17:00–19:00 | 39–42 | SBA |
| G — Frontend | 19:00–21:30 | 43–52 | frontend/rev-dashboard |
| H — Pruebas (puente) | 21:30–22:00 | 30 | src/test |

---

## Bloque A — Arquitectura de componentes (ítems 1–4)

### Ítem 1 · Problemática del caso

**Pantalla:** Diapositiva 3 EVA2 (Problema Valle del Sol)

**Narración:**
«Valle del Sol debe coordinar incendios forestales, incidentes urbanos y alertas vecinales con demanda impredecible. Un monolito acopla todo: un fallo detiene el despacho completo. REV propone microservicios por dominio de negocio para escalar y aislar fallos. Este es el caso municipal que seleccionamos desde la EVA1.»

---

### Ítem 2 · Descomposición DDD y justificación microservicios

**Pantalla:** `docs/patrones-y-arquitectura-rev.md` §6 DDD + diagrama mermaid §2

**Narración:**
«Descompusimos el sistema en tres bounded contexts: **Incidentes** (ciclo de vida y correlación), **Zonas de riesgo** (territorio PostGIS y clima), y **Recursos** (brigadas y logística). El BFF agrega la vista operador; el Gateway unifica seguridad. Esto resuelve acoplamiento y permite escalar solo el servicio bajo presión — por ejemplo, más réplicas de incidentes en temporada de incendios sin tocar recursos.»

---

### Ítem 3 · Descripción de cada componente con justificación

**Pantalla:** Diapositiva 6–7 (capas) o tabla §2.1 patrones-y-arquitectura

**Narración (recorrer lista):**

| Componente | Justificación en pantalla |
|------------|----------------------------|
| React SPA | UX unificada despacho + portal ciudadano |
| API Gateway | Punto único de entrada, JWT, rate limit público |
| keycloak-adapter | Desacopla OAuth2/Keycloak del Gateway |
| bff-rev | Facade: una llamada dashboard vs N microservicios |
| ms-incidentes | Reglas de estado y correlación geo |
| ms-zonas-riesgo | PostGIS + adapter clima |
| ms-recursos | Dotación y asignaciones |
| Eureka | Service discovery dinámico |
| PostgreSQL ×3 | Database per service — integridad por dominio |
| Spring Boot Admin | Observabilidad centralizada |

---

### Ítem 4 · Explicar cada componente en el diagrama

**Pantalla:** Diapositiva 5 o diagrama despliegue en `patrones-y-arquitectura-rev.md` §2.2

**Narración:**
«Sigo el flujo de una petición: el operador en React llama al Gateway en puerto 18080. El filtro valida JWT. El BFF resuelve `MS-INCIDENTES` vía Eureka con `lb://` y compone la respuesta. Cada microservicio persiste en su base. Si zonas no responde, el Circuit Breaker del BFF devuelve datos cacheados con flag `degraded`.»

---

## Bloque B — Service Discovery (ítems 5–11)

### Ítem 5 · Service Discovery como BD dinámica de ubicaciones

**Pantalla:** Navegador Eureka http://localhost:18761

**Narración:**
«Eureka actúa como registro dinámico: cada instancia anuncia su IP y puerto al arrancar. Los clientes no hardcodean hosts — consultan el registro en tiempo de ejecución. Es la base de datos de ubicaciones de red del ecosistema.»

---

### Ítem 6 · Justificación de Service Discovery

**Pantalla:** Eureka dashboard con instancias UP

**Narración:**
«Justificamos Eureka porque en Docker las IPs cambian entre reinicios. Con self-registration, agregar una réplica de ms-incidentes no requiere reconfigurar el BFF — Eureka balancea con Ribbon/LoadBalancer.»

---

### Ítem 7 · Cómo se trabaja Eureka — lo bueno y lo malo

**Pantalla:** `bff-rev` → `application.properties` → `eureka.client.serviceUrl`

**Narración:**
«**Lo bueno:** descubrimiento automático, health checks, integración Spring Cloud. **Lo malo:** eventual consistency — un servicio recién caído puede recibir tráfico unos segundos; en producción usaríamos readiness probes más estrictos. En REV mitigamos con Circuit Breaker y timeouts en WebClient.»

---

### Ítem 8 · Configuración si requiere modificación

**Pantalla:** `infraestructuredomain/eureka-server/src/main/resources/application.properties`

**Narración:**
«Para cambiar el puerto o el hostname de registro, editamos `server.port` y `eureka.instance.hostname` en cada servicio. En clientes, `eureka.client.serviceUrl.defaultZone` apunta al servidor. Tras cambio: rebuild JAR y reinicio contenedor.»

---

### Ítem 9 · Self-Registration (Eureka)

**Pantalla:** Cualquier MS → `application.properties` → `eureka.client.register-with-eureka=true`

**Narración:**
«Usamos el patrón Self-Registration: cada microservicio incluye `spring-cloud-starter-netflix-eureka-client` y se registra solo al boot. No hay sidecar externo — es el enfoque estándar Spring Cloud Netflix.»

---

### Ítem 10 · Ubicación en el repositorio

**Pantalla:** IDE árbol `infraestructuredomain/eureka-server/`

**Narración:**
«El código está en `infraestructuredomain/eureka-server`. El monorepo completo se clona desde GitHub — ver `docs/repositorios.txt`. Rama de integración: `dev`.»

---

### Ítem 11 · Cómo levantar el servicio

**Pantalla:** Terminal con comando (no ejecutar build completo en cámara si ya está UP)

**Narración:**
«Desde la raíz: `.\scripts\dev-up.ps1 -DockerApps -Build` levanta Eureka junto con todo el stack. Solo Eureka: `cd infraestructuredomain/eureka-server` y `mvnw spring-boot:run`. Verificamos en localhost:18761 que aparezcan BFF-REV, MS-INCIDENTES, MS-ZONAS-RIESGO, MS-RECURSOS en estado UP.»

---

## Bloque C — Microservicios (ítems 12–30)

> Repetir sub-bloque **12–25** para cada MS. En video, agrupar: primero ms-incidentes completo, luego zonas+recursos resumido, luego bff.

### Ítems 12–16 · Dominio, reglas, datos, validaciones, casos de uso

**Pantalla:** `businessdomain/ms-incidentes/README.md` + paquetes `controller`, `service`, `entity`

**Narración ms-incidentes:**
«**Dominio:** ciclo de vida de incidentes y correlación geográfica. **Reglas:** no pasar a EN_PROGRESO sin georreferenciación; correlaciones con score y radio por tipo. **Datos:** entidad JPA `Incidente`, JSON motivo en correlaciones. **Validaciones:** Bean Validation en DTOs + reglas en Factory. **Casos de uso:** reportar, transicionar estado, confirmar/descartar/revertir correlación.»

**Pantalla:** `businessdomain/ms-zonas-riesgo/` — mencionar PostGIS

**Narración ms-zonas (30 s):**
«Dominio territorial: zonas con radio y nivel de riesgo; resolver punto GPS; adapter clima fake para demo.»

**Pantalla:** `businessdomain/ms-recursos/`

**Narración ms-recursos (30 s):**
«Dominio logístico: brigadas, vehículos, asignaciones multi-brigada; regla ASIGNACION_DUPLICADA.»

---

### Ítem 17 · Estructura de carpetas

**Pantalla:** Árbol ms-incidentes expandido

```
ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/
├── controller/
├── service/
├── entity/
├── repository/
├── state/          ← Factory + State
├── correlacion/
├── exception/
└── config/
```

**Narración:**
«Seguimos el arquetipo Maven REV: capas Controller → Service → Repository. Estados en paquete `state`; correlación aislada en `correlacion`. Misma estructura en los tres microservicios.»

---

### Ítem 18 · Dependencias en configuración

**Pantalla:** `businessdomain/ms-incidentes/pom.xml` + parent `businessdomain/pom.xml`

**Narración:**
«Dependencias clave: Spring Web, Spring Data JPA, PostgreSQL driver, Flyway, Eureka Client, Actuator, springdoc-openapi. El parent POM centraliza versiones Spring Boot 4 y Spring Cloud.»

---

### Ítem 19 · Funcionamiento de controladores

**Pantalla:** Abrir `IncidenteController.java` y `CorrelacionController.java`

**Narración:**
«Los controllers exponen REST, delegan al service, retornan DTOs — nunca entidades JPA directas. Ejemplo: POST `/incidentes` crea con 201; GET `/correlaciones/pendientes` lista sugerencias. OpenAPI documenta contratos en `/v3/api-docs`.»

---

### Ítem 20 · Seguridad en microservicios

**Pantalla:** Comentar que JWT se valida en Gateway; MS confían red interna Docker

**Narración:**
«La seguridad perimetral está en el Gateway. Los microservicios en red interna reciben headers `X-User-Id` y roles propagados por el filtro. Endpoints públicos solo en rutas `/api/public/**` del Gateway.»

---

### Ítem 21 · Patrones aplicados y dónde en código

**Pantalla:** Archivos concretos

| Patrón | Archivo |
|--------|---------|
| Factory + State | `state/IncidentStateFactory.java`, `ReportadoState.java` |
| Repository | `repository/IncidenteRepository.java` |
| Adapter | `ms-zonas-riesgo/adapter/FakeWeatherAdapter.java` |
| Facade | `bff-rev/service/DashboardFacadeService.java` |
| Circuit Breaker | `bff-rev` Resilience4j config + `@CircuitBreaker` |

**Narración:**
«Factory Method selecciona el estado según `EstadoIncidente`; cada estado valida transiciones. Adapter desacopla API clima. Facade en BFF orquesta WebClients. Circuit Breaker evita cascada de fallos.»

---

### Ítem 22 · Archivos de configuración

**Pantalla:** `application.properties` ms-incidentes

**Narración:**
«`application.properties` define puerto, datasource PostgreSQL, Flyway locations, Eureka URL, logging levels. Perfil `docker` para contenedores; perfil `test` con H2 para pruebas.»

---

### Ítem 23 · Levantar microservicio y comprobar

**Pantalla:** Eureka + Actuator

**Narración:**
«Tras `dev-up`, verifico MS-INCIDENTES UP en Eureka. Health: `http://localhost:8081/actuator/health` (puerto host mapeado en Docker). Swagger UI vía Gateway en ruta documentada.»

---

### Ítem 24 · Manejo de excepciones

**Pantalla:** `exception/ApiExceptionHandler.java` (ms-incidentes)

**Narración:**
«`@RestControllerAdvice` centraliza errores: `BusinessRuleException` → 422 con código; validación → 400; no encontrado → 404. Respuesta JSON uniforme para el frontend.»

---

### Ítem 25 · Buenas prácticas en microservicios

**Pantalla:** Controller con `@Valid`, DTOs, logging SLF4J

**Narración:**
«Aplicamos: DTOs de frontera, validación Jakarta, códigos HTTP semánticos (201 creación, 404 no encontrado), logging estructurado, OpenAPI, migraciones Flyway versionadas, tests unitarios en services.»

---

### Ítem 26 · Circuit Breaker — configuración

**Pantalla:** `bff-rev/src/main/resources/application.properties` — resilience4j

**Narración:**
«Resilience4j en el BFF: instancias por cliente WebClient hacia zonas y recursos. Si falla zonas, fallback retorna riesgo cacheado y marca `degraded=true` en dashboard.»

---

### Ítem 27 · Buenas prácticas HTTP status

**Pantalla:** Controller — buscar `ResponseEntity.status(HttpStatus.CREATED)`

**Narración:**
«POST exitoso retorna 201 Created con Location. Errores de negocio 422 o 409 según caso. El Gateway retorna 401 sin token y 503 si adapter caído.»

---

### Ítem 28 · Log interno

**Pantalla:** `application.properties` → `logging.level.cl.duocuc.rev`

**Narración:**
«Configuramos niveles DEBUG/INFO por paquete en desarrollo. Logs en consola Docker: `docker logs rev-ms-incidentes`. Permite trazar correlaciones y asignaciones en incidentes futuros.»

---

### Ítem 29 · Métricas internas

**Pantalla:** Actuator — `/actuator/metrics`, `/actuator/health`

**Narración:**
«Spring Boot Actuator expone health, info y métricas JVM. Spring Boot Admin agrega vista unificada. En producción conectaríamos Prometheus/Grafana.»

---

### Ítem 30 · Pruebas realizadas (unitarias, integración, frontend)

**Pantalla:** `ms-incidentes/src/test/java/` — listar clases

**Narración:**
«En ms-incidentes: `IncidentStateFactoryTest`, `CorrelacionServiceTest`, `CorrelacionScorerTest`, `GeoUtilsTest`. En bff-rev: `CorrelacionFacadeServiceTest`. Frontend: pruebas E2E manuales en video de plataforma de Nicolás. Informe completo en `docs/informe-evidencias/eva3/informe-pruebas-eva3.md`. Ejecutamos con `mvn test` y reporte JaCoCo.»

---

## Bloque D — Seguridad (ítems 31–35)

### Ítem 31 · Justificación de seguridad

**Pantalla:** Diapositiva 18 EVA2

**Narración:**
«El despacho maneja datos sensibles de emergencias. Keycloak centraliza identidad; JWT stateless escala horizontalmente; Gateway evita exponer microservicios directamente a Internet.»

---

### Ítem 32 · Cómo se genera el JWT

**Pantalla:** `keycloak-adapter/.../AuthController.java` + `JwtService.java`

**Narración:**
«El frontend POST `/auth/login` al Gateway, que reenvía al keycloak-adapter. Este intercambia credenciales con Keycloak realm `rev` y retorna access_token JWT firmado.»

---

### Ítem 33 · Cómo se configura el JWT

**Pantalla:** Keycloak admin `localhost:18090` (mencionar realm rev) + properties adapter

**Narración:**
«Realm `rev` define clientes, roles DESPACHADOR/BRIGADISTA/ADMIN. El adapter configura issuer URI y client secret en `application.properties`. Gateway conoce el header Authorization Bearer.»

---

### Ítem 34 · Cómo se valida el JWT

**Pantalla:** `api-gateway/.../AuthenticationFilter.java` + `JwtPayloadDecoder.java`

**Narración:**
«El filtro del Gateway extrae el Bearer token, decodifica payload JWT, valida expiración y extrae roles con `JwtPayloadDecoder`. Si falta token en ruta protegida → 401. Propaga username y roles como headers downstream.»

---

### Ítem 35 · Enrutamiento con seguridad

**Pantalla:** `api-gateway/src/main/resources/application.yml` — rutas

**Narración:**
«Rutas `/api/public/**` y `/auth/**` sin JWT. Rutas `/api/**` requieren filtro AuthenticationFilter. El Gateway enruta a `lb://BFF-REV` o `lb://KEYCLOAK-ADAPTER` según path.»

---

## Bloque E — API Gateway (ítems 36–38)

### Ítem 36 · Funcionamiento API Gateway

**Pantalla:** Diagrama slide 6 + Gateway yaml

**Narración:**
«Spring Cloud Gateway es reactivo (WebFlux). Termina TLS en producción, aplica filtros globales, balancea vía Eureka y enruta por predicados path. Un solo puerto 18080 para el frontend.»

---

### Ítem 37 · Componentes del Gateway

**Pantalla:** Paquete `cl.duocuc.rev.gateway`

**Narración:**
«Clases clave: `ApiGatewayApplication`, `AuthenticationFilter`, `PublicRateLimitFilter`, `JwtPayloadDecoder`, configuración de rutas en YAML. CORS habilitado para Vite en desarrollo.»

---

### Ítem 38 · Cómo filtra peticiones

**Pantalla:** `AuthenticationFilter.filter()` — método apply

**Narración:**
«Cadena de filtros: rate limit en portal público → autenticación JWT → forward al servicio destino. Peticiones inválidas nunca llegan al BFF.»

---

## Bloque F — Monitoreo (ítems 39–42)

### Ítem 39 · Justificación monitoreo

**Pantalla:** Spring Boot Admin http://localhost:18099

**Narración:**
«En emergencias no podemos descubrir un MS caído por teléfono. SBA consolida health de todas las apps registradas en Eureka.»

---

### Ítem 40 · Acciones si un microservicio falla

**Narración:**
«1) SBA muestra status DOWN. 2) Eureka deja de enviar tráfico tras heartbeat. 3) BFF activa Circuit Breaker — UI en modo degraded. 4) Operador reinicia contenedor o escala réplica. 5) Revisar logs Docker.»

---

### Ítem 41 · Cómo se entera si falla

**Pantalla:** SBA — lista apps rojas + Actuator health detail

**Narración:**
«Spring Boot Admin consulta `/actuator/health` periódicamente. Notificación visual inmediata en wallboard. Eureka refleja instancia OUT_OF_SERVICE.»

---

### Ítem 42 · Seguimiento para mejoras

**Narración:**
«Registramos incidentes de disponibilidad en retrospectiva. Mejoras futuras: alertas Slack, Prometheus, tracing distribuido con Micrometer Tracing.»

---

## Bloque G — Frontend (ítems 43–52)

### Ítem 43 · Funcionalidad y tecnología elegida

**Pantalla:** `frontend/rev-dashboard/package.json`

**Narración:**
«Elegimos React 18 + Vite + TypeScript: tipado estático, hot reload rápido, ecosistema maduro. Bootstrap + React-Bootstrap para UI operacional consistente. Leaflet para mapas — estándar en GIS web.»

---

### Ítem 44 · Reglas de negocio en frontend

**Pantalla:** Componentes despacho / correlaciones

**Narración:**
«El frontend no duplica reglas críticas — las valida el backend. UI guía al operador: no permite acciones sin selección; muestra estados de incidente; correlaciones en pestañas Pendientes/Confirmadas/Descartadas.»

---

### Ítem 45 · Buenas prácticas — TypeScript

**Pantalla:** `src/api.ts` — interfaces TypeScript

**Narración:**
«TypeScript en todo el código fuente. Interfaces para DTOs del BFF. Componentes funcionales con hooks. Rutas con React Router 7.»

---

### Ítem 46 · Seguridad y cambios ante solicitudes

**Pantalla:** `AuthContext` o login flow + `api.ts` headers

**Narración:**
«Token JWT en memoria/sessionStorage; interceptor añade Authorization. Roles controlan rutas visibles. Para cambiar permisos: ajustar roles Keycloak + guards en `App.tsx` — no hardcodear en componentes.»

---

### Ítem 47 · Petición sin respuesta

**Pantalla:** `api.ts` — manejo fetch errors / timeout

**Narración:**
«Si fetch falla o timeout, mostramos toast de error y componente `StateView` con reintento. No dejamos spinners infinitos — timeout configurado en cliente.»

---

### Ítem 48 · Tiempos de respuesta

**Narración:**
«El BFF agrega datos — una sola llamada dashboard vs tres al backend. Medimos en DevTools Network; objetivo < 2 s en LAN local. Modo degraded responde aunque zonas tarde.»

---

### Ítem 49 · Estándares rendimiento y disponibilidad UI

**Narración:**
«Objetivos demo: carga inicial < 3 s; interacción mapa fluida 30 fps; disponibilidad percibida con degraded mode cuando falta un MS secundario.»

---

### Ítem 50 · Log interno frontend

**Narración:**
«En desarrollo: console.log estructurado en errores API. Producción: integraríamos Sentry. DevTools para diagnóstico en taller.»

---

### Ítem 51 · Mensajes concordantes con negocio

**Pantalla:** Toast / alertas en UI — `DegradedAlert`

**Narración:**
«Mensajes en español claro: "Información parcial — servicio de zonas no disponible" en lugar de errores técnicos crudos. El operador entiende qué hacer.»

---

### Ítem 52 · Manejo de excepciones frontend

**Pantalla:** Componente error boundary o StateView

**Narración:**
«Errores HTTP mapeados: 401 → redirect login; 403 → sin permiso; 5xx → mensaje reintentar. Formularios muestran errores de validación del backend campo a campo.»

---

## Bloque H — Cierre (puente a pruebas)

**Pantalla:** `docs/informe-evidencias/eva3/`

**Narración:**
«Esta arquitectura se valida con pruebas unitarias, integración y E2E documentadas en el informe EVA3. Mi compañero Nicolás demuestra la plataforma en uso y la ejecución de pruebas en sus videos. REV cumple BFF más microservicios, persistencia JPA aislada, seguridad JWT y observabilidad — listo para escalar por dominio en Valle del Sol.»

---

## Checklist final Giannina

- [ ] Ítems 1–52 narrados
- [ ] Eureka y SBA mostrados en vivo
- [ ] Al menos 3 archivos Java de patrones abiertos
- [ ] Gateway + JWT explicados
- [ ] Frontend `api.ts` mostrado
- [ ] Mención informe pruebas EVA3
- [ ] Duración 18–22 min
- [ ] Audio claro, mouse lento

---

## Referencias rápidas

| Tema | Ruta |
|------|------|
| Arquitectura | `docs/patrones-y-arquitectura-rev.md` |
| Eureka | `infraestructuredomain/eureka-server/` |
| Gateway | `infraestructuredomain/api-gateway/` |
| JWT adapter | `infraestructuredomain/keycloak-adapter/` |
| BFF | `infraestructuredomain/bff-rev/` |
| MS incidentes | `businessdomain/ms-incidentes/` |
| MS zonas | `businessdomain/ms-zonas-riesgo/` |
| MS recursos | `businessdomain/ms-recursos/` |
| Frontend | `frontend/rev-dashboard/` |
| Tests | `*/src/test/java/` |
| Informe EVA3 | `docs/informe-evidencias/eva3/informe-pruebas-eva3.md` |
