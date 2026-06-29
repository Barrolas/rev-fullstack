# Guion video arquitectura — EVA3 REV

| Campo | Valor |
|-------|-------|
| **Responsable grabación** | Giannina Guerrero |
| **Formato** | Pantalla + voz — **PDF prioritario**, EN VIVO solo Eureka y SBA |
| **Duración objetivo** | 18–22 minutos |
| **Checklist** | 52 ítems — Video de Arquitectura |
| **Apoyo visual principal** | `docs/informe-evidencias/eva3/Presentacion-REV-EVA3.pdf` (38 slides) |
| **Tono del video** | Profesional y orientado al valor |

> Marca **✓** en el checklist Excel al grabar cada ítem.
>
> **Tip:** avanza slides con **flecha derecha**. Lee la **narración completa** de cada ítem (2–4 frases); señala el diagrama mientras hablas. No abras el IDE salvo **Alternativa IDE**.

### Formato de cada ítem

| Campo | Significado |
|-------|-------------|
| **Slide** | Número en el PDF — **úsala primero** |
| **Tiempo** | Segundos sugeridos |
| **Pantalla** | Qué señalar en la slide |
| **EN VIVO** | Navegador — solo si aparece |
| **Alternativa IDE** | Archivo en repo — si sobra tiempo |
| **Narración** | Texto para leer en voz — frases completas |

---

## 0. Preparación (antes de grabar)

### 0.1 Entorno mínimo

```powershell
cd rev-fullstack
.\scripts\dev-up.ps1
```

| Verificación | URL |
|--------------|-----|
| Eureka | http://localhost:18761 |
| Spring Boot Admin | http://localhost:18099 |

### 0.2 Pestañas fijas

1. **PDF** `docs/informe-evidencias/eva3/Presentacion-REV-EVA3.pdf` — pantalla principal
2. Eureka `18761`
3. Spring Boot Admin `18099`

### 0.3 IDE (opcional — no abrir al inicio)

`AuthenticationFilter.java` · `IncidentStateFactory.java` · `api.ts` — solo al final si sobra tiempo.

### 0.4 Orden de slides en el PDF (EVA3 · 38 slides)

**Arquitectura (video):** **3 → 4 → 12 → 6 → 7 → 8 → 9 → 11 → 10 → 19 → 20 → 21 → 18 → 13 → 17 → 25 → 15 → 35 → 36 → 38**

**Opcional contexto EVA3:** slide **2** (valor operacional) al inicio · slides **26–31** (calidad y pruebas) si el docente pregunta por evidencia.

### 0.5 Índice completo — Presentacion-REV-EVA3.pdf

| Slide | Título |
|-------|--------|
| **1** | Portada oficial |
| **2** | Plataforma REV — valor operacional |
| **3** | Problema identificado |
| **4** | Objetivos del proyecto |
| **5** | Visión general de REV |
| **6** | Arquitectura general |
| **7** | Microservicios implementados |
| **8** | Infraestructura de plataforma |
| **9** | Patrones arquitectónicos |
| **10** | Patrones de diseño implementados |
| **11** | Arquetipos utilizados |
| **12** | DDD y Bounded Contexts |
| **13** | Frontend y experiencia de usuario |
| **14** | Reporte público y canal ciudadano |
| **15** | Capturas operativas del sistema |
| **16** | Diseño UX/UI y Design System |
| **17** | Roles y permisos |
| **18** | Seguridad |
| **19** | Continuidad operacional y resiliencia |
| **20** | Persistencia y base de datos |
| **21** | Observabilidad y trazabilidad |
| **22** | Estrategia Git y trabajo colaborativo |
| **23** | Trazabilidad técnica |
| **24** | Tecnologías utilizadas |
| **25** | Flujo funcional del sistema |
| **26** | Estrategia de calidad y pruebas |
| **27** | Áreas críticas bajo prueba |
| **28** | Matriz de pruebas — flujos críticos |
| **29** | Resultados de ejecución automatizada |
| **30** | Cobertura JaCoCo por módulo |
| **31** | Patrones validados por la suite |
| **32** | Bugs detectados y correcciones |
| **33** | Pruebas end-to-end |
| **34** | Entregables del producto |
| **35** | Resultados obtenidos |
| **36** | Conclusiones |
| **37** | Evolución futura |
| **38** | Conectividad que salva vidas (cierre) |

> Slides **1–25** coinciden en número y contenido con EVA2 (más slide **2** de valor operacional). Slides **26–34** son evidencia de pruebas EVA3. Cierre en **35–38**.

---

## Apertura (antes del ítem 1)

**Narración (~20 s):**
«Buenos días. Soy Giannina Guerrero. En este video explico la arquitectura de REV, la plataforma de emergencias que desarrollamos para la Municipalidad de Valle del Sol.

Voy a apoyarme en nuestra presentación del proyecto y, en dos momentos, mostraré Eureka y Spring Boot Admin funcionando. El uso operativo de la plataforma y las pruebas los complementa mi compañero Nicolás Barra en los otros videos del equipo.»

---

## Mapa de bloques (modo slides · ~18 min)

| Bloque | Tiempo | Ítems | Slides | EN VIVO |
|--------|--------|-------|--------|---------|
| A — Contexto | 0:00–2:00 | 1–4 | 3, 4, 12, 6, 7 | — |
| B — Discovery | 2:00–4:00 | 5–11 | 8, 9 | Eureka |
| C — Microservicios | 4:00–8:00 | 12–30 | 7, 11, 10, 19, 20, 21 | SBA 10 s |
| D — Seguridad | 8:00–10:00 | 31–35 | 18 | — |
| E — Gateway | 10:00–11:00 | 36–38 | 6, 18, 9 | — |
| F — Monitoreo | 11:00–12:00 | 39–42 | 21 | SBA |
| G — Frontend | 12:00–14:00 | 43–52 | 13, 17, 25, 15 | — |
| H — Cierre | 14:00–15:00 | 30 | **35**, **36**, **38** | — |

### Mapa ítem → slide

| Ítems | Slide | Título PPT | EN VIVO |
|-------|-------|------------|---------|
| 1 | **3** | Problema identificado | — |
| 2 | **4**, **12** | Objetivos · DDD | — |
| 3 | **7** | Microservicios | — |
| 4 | **6** | Arquitectura general | — |
| 5–11 | **8**, **9** | Infra · Patrones arq. | Eureka |
| 12–16 | **7** | Microservicios (cards) | — |
| 17 | **11** | Arquetipos | — |
| 18 | **24** | Tecnologías | — |
| 19, 24–25 | **10** | Patrones diseño | — |
| 20, 31–34 | **18** | Seguridad | — |
| 21, 26 | **10**, **19** | Patrones · Resiliencia | — |
| 22 | **20** | Persistencia | — |
| 23, 28–29 | **21** | Observabilidad | Health / SBA |
| 27, 35 | **18**, **9** | Seguridad · Gateway | — |
| 30, H | **35**, **36**, **38** | Resultados · Conclusiones · Cierre | — |
| 36–38 | **6**, **18** | Arq. · Seguridad | — |
| 39–42 | **21** | Observabilidad | SBA |
| 43–46 | **13**, **17** | Frontend · Roles | — |
| 47–49 | **19**, **25** | Resiliencia · Flujo | — |
| 50–52 | **13**, **15** | Capturas | — |

**Slide sustituye código:** State→**10** · CB/Facade→**19** · JWT→**18** · capas→**11** · UI→**13**/**15**

**Si vas atrasada (desde bloque C):** 7 → 11 → 10 → 19 → 20 → 21+SBA → 18 → 13 → 25 → 15 → **36** → **38**

**Frase al cambiar slide:** «En nuestra presentación de arquitectura esto queda así…»

---

## Bloque A — Arquitectura de componentes (ítems 1–4)

> Slides del bloque: **3 → 4 → 12 → 7 → 6**

### Ítem 1 · Problemática del caso

| | |
|--|--|
| **Slide** | **3** — Problema identificado |
| **Tiempo** | ~25 s |
| **Pantalla** | Diagrama monolito vs microservicios; tabla de limitaciones |
| **EN VIVO** | — |
| **Alternativa IDE** | — |

**Narración:** «Valle del Sol coordina emergencias municipales con picos de demanda impredecibles, como incendios o inundaciones que ocurren al mismo tiempo. En esta slide comparamos un sistema monolítico — donde un fallo puede tumbar toda la operación — con nuestra propuesta REV, basada en microservicios separados por área de negocio.

Esa separación nos permite aislar fallos y escalar solo la parte del sistema que lo necesita, sin detener el despacho completo.»

---

### Ítem 2 · Descomposición DDD y justificación microservicios

| | |
|--|--|
| **Slide** | **4** (objetivos) → **12** (DDD) |
| **Tiempo** | ~40 s |
| **Pantalla** | Tabla objetivo→MS en slide 4; context map en slide 12 |
| **EN VIVO** | — |
| **Alternativa IDE** | `docs/patrones-y-arquitectura-rev.md` §6 |

**Narración:** «Seguimos el enfoque DDD, diseño guiado por el dominio: dividimos el sistema en tres áreas de negocio independientes — incidentes, zonas y recursos — y cada una tiene su propia base de datos. En la slide 4 vemos cómo cada objetivo del proyecto se traduce en un microservicio; en la slide 12, el mapa de contextos muestra esas fronteras con claridad.

El BFF, que significa Backend for Frontend, agrupa la información del dashboard en una sola respuesta para la interfaz. El Gateway es la única puerta de entrada desde internet. Si hay una crisis en un dominio concreto, podemos escalar solo ese servicio sin tocar el resto.»

---

### Ítem 3 · Descripción de cada componente con justificación

| | |
|--|--|
| **Slide** | **7** — Microservicios implementados |
| **Tiempo** | ~45 s |
| **Pantalla** | Cards ms-incidentes, ms-zonas, ms-recursos + tabla puertos |
| **EN VIVO** | — |
| **Alternativa IDE** | `docs/patrones-y-arquitectura-rev.md` §2.1 |

**Narración (recorrer las tres cards):**
«Esta slide resume los componentes principales. React es la interfaz que ve el operador y el ciudadano. El Gateway concentra la seguridad en un solo punto de entrada. El BFF evita que el frontend haga muchas llamadas: entrega el dashboard en una sola respuesta.

Los tres microservicios guardan las reglas de negocio de incidentes, mapas y recursos. Eureka sabe dónde está cada servicio en cada momento, cada uno tiene su PostgreSQL, y Spring Boot Admin nos permite ver si todo está sano.»

---

### Ítem 4 · Explicar cada componente en el diagrama

| | |
|--|--|
| **Slide** | **6** — Arquitectura general |
| **Tiempo** | ~30 s |
| **Pantalla** | Flechas React → Gateway → BFF → MS → BD |
| **EN VIVO** | — |
| **Alternativa IDE** | `docs/patrones-y-arquitectura-rev.md` §2.2 |

**Narración:** «En esta slide vemos el diagrama general de extremo a extremo, como muestran las flechas del esquema. El operador usa React; las peticiones pasan por el Gateway en el puerto 18080, luego llegan al BFF — que localiza servicios mediante Eureka — y de ahí a los tres microservicios, cada uno con su propia base PostgreSQL.

Si un microservicio falla, el BFF entra en modo degradado: el despacho sigue operando con la información disponible, en lugar de quedarse con una pantalla en blanco.»

---

## Bloque B — Service Discovery (ítems 5–11)

> Slides del bloque: **8 → 9** · EN VIVO: Eureka

### Ítem 5 · Service Discovery como BD dinámica de ubicaciones

| | |
|--|--|
| **Slide** | **8** — Infraestructura (card Eureka) |
| **Tiempo** | ~20 s |
| **Pantalla** | Card Eureka :8761 en slide 8 |
| **EN VIVO** | http://localhost:18761 — home Eureka (5 s) |
| **Alternativa IDE** | — |

**Narración:** «Eureka actúa como un directorio dinámico de servicios: cada microservicio se registra automáticamente cuando arranca, como muestra la card de esta slide. Así no dependemos de direcciones IP fijas que cambian en Docker o en la nube.

El ecosistema se reconfigura solo cuando aparecen o desaparecen instancias, sin editar manualmente la configuración del BFF ni del Gateway.»

---

### Ítem 6 · Justificación de Service Discovery

| | |
|--|--|
| **Slide** | **8** |
| **Tiempo** | ~20 s |
| **Pantalla** | Mismo card + diagrama compose en slide 8 |
| **EN VIVO** | Eureka — lista **Applications** UP (10 s) |
| **Alternativa IDE** | — |

**Narración:** «En entornos Docker las direcciones IP de los contenedores cambian cada vez que se reinician. Eureka resuelve ese problema descubriendo automáticamente dónde está cada servicio en cada momento.

Cuando levantamos una nueva instancia de un microservicio, Eureka la detecta sin que tengamos que modificar el código del BFF. Eso es escalabilidad horizontal real: más capacidad añadiendo réplicas, no reescribiendo configuración.»

---

### Ítem 7 · Cómo se trabaja Eureka — ventajas y complementos

| | |
|--|--|
| **Slide** | **9** — Patrones arquitectónicos (fila Service Discovery) |
| **Tiempo** | ~20 s |
| **Pantalla** | Fila Eureka + `lb://` en tabla slide 9 |
| **EN VIVO** | — |
| **Alternativa IDE** | `bff-rev/.../application.properties` → `eureka.client.serviceUrl.defaultZone` |

**Narración:** «En esta slide vemos Eureka integrado con Spring Cloud: el registro y la búsqueda de servicios ocurren de forma automática en nuestro stack. No es un componente aislado, sino parte del ecosistema de microservicios que ya usamos.

Lo combinamos con timeouts y modo degradado en el BFF, de modo que si un servicio tarda demasiado o no responde, el despacho sigue operando con información parcial en lugar de bloquearse por completo.»

---

### Ítem 8 · Configuración si requiere modificación

| | |
|--|--|
| **Slide** | **8** |
| **Tiempo** | ~15 s |
| **Pantalla** | Comando `dev-up.ps1` en callout slide 8 |
| **EN VIVO** | — |
| **Alternativa IDE** | `eureka-server/.../application.properties` |

**Narración:** «Si necesitamos modificar la configuración, el puerto y la URL de Eureka están declarados en el archivo `application.properties` de cada módulo, como indica el callout de esta slide. Es el mismo patrón en todos los microservicios y en el BFF.

Ese enfoque estandarizado facilita el mantenimiento: cualquier desarrollador del equipo sabe dónde buscar y qué cambiar sin sorpresas.»

---

### Ítem 9 · Self-Registration (Eureka)

| | |
|--|--|
| **Slide** | **9** — fila Service Discovery |
| **Tiempo** | ~15 s |
| **Pantalla** | Tabla patrones slide 9 |
| **EN VIVO** | — |
| **Alternativa IDE** | `ms-incidentes/.../application.properties` → `spring.application.name` |

**Narración:** «Cada microservicio usa auto-registro: al iniciar, el cliente de Eureka lo incorpora al directorio sin pasos manuales. En la tabla de patrones de esta slide vemos Service Discovery como pieza central de la arquitectura.

El proceso es transparente y repetible: levantamos el servicio y en segundos aparece registrado, listo para recibir tráfico desde el BFF.»

---

### Ítem 10 · Ubicación en el repositorio

| | |
|--|--|
| **Slide** | **8** o **22** — Git (opcional) |
| **Tiempo** | ~15 s |
| **Pantalla** | Mencionar monorepo en voz; slide 22 si quieres mostrar Git |
| **EN VIVO** | — |
| **Alternativa IDE** | `infraestructuredomain/eureka-server/` · `docs/repositorios.txt` |

**Narración:** «En el repositorio, Eureka vive en la carpeta `infraestructuredomain/eureka-server`, separada del código de negocio de los microservicios. Todo el proyecto está en un monorepo en GitHub, en la rama `dev`, como documentamos en `repositorios.txt`.

Esa separación entre infraestructura y dominio refleja la arquitectura: Eureka es un servicio transversal, no parte de la lógica de incidentes o recursos.»

---

### Ítem 11 · Cómo levantar el servicio

| | |
|--|--|
| **Slide** | **8** |
| **Tiempo** | ~15 s |
| **Pantalla** | Callout `.\scripts\dev-up.ps1` |
| **EN VIVO** | Eureka con apps UP (5 s) |
| **Alternativa IDE** | Terminal con `dev-up.ps1` |

**Narración:** «Para levantar el entorno completo usamos el script `dev-up.ps1`, que aparece en el callout de esta slide. Arranca Eureka, los microservicios, el BFF y el resto de componentes en el orden correcto.

La verificación es sencilla: en la consola de Eureka deben aparecer BFF, MS-INCIDENTES, MS-ZONAS y MS-RECURSOS con estado UP, lo que confirma que el ecosistema está operativo.»

---

## Bloque C — Microservicios (ítems 12–30)

> Slides del bloque: **7 → 11 → 10 → 19 → 20 → 21** · EN VIVO: SBA 10 s

### Ítems 12–16 · Dominio, reglas, datos, validaciones, casos de uso

| | |
|--|--|
| **Slide** | **7** — Microservicios implementados |
| **Tiempo** | ~60 s |
| **Pantalla** | Las tres cards: incidentes (ciclo de vida), zonas (PostGIS), recursos (logística) |
| **EN VIVO** | — |
| **Alternativa IDE** | `ms-incidentes/`, `ms-zonas-riesgo/`, `ms-recursos/` |

**Narración:** «En esta slide recorremos las tres cards de microservicios. El de incidentes gestiona el ciclo de vida completo — desde la creación hasta el cierre — y la correlación entre eventos relacionados. El de zonas trabaja con riesgo territorial y mapas geográficos mediante PostGIS, la extensión geoespacial de PostgreSQL.

El de recursos administra brigadas y asignaciones logísticas. Cada dominio concentra sus reglas de negocio y su base de datos independiente, sin mezclar responsabilidades entre áreas.»

---

### Ítem 17 · Estructura de carpetas

| | |
|--|--|
| **Slide** | **11** — Arquetipos utilizados |
| **Tiempo** | ~20 s |
| **Pantalla** | Diagrama Controller → Service → Repository |
| **EN VIVO** | — |
| **Alternativa IDE** | Árbol `ms-incidentes/.../incidentes/` |

**Narración:** «Todos los microservicios comparten el mismo arquetipo de carpetas, como muestra el diagrama de esta slide: controller, service y repository en capas bien definidas. En incidentes añadimos paquetes adicionales para `state` y `correlacion`, porque ese dominio tiene más complejidad en su ciclo de vida.

Esa estructura común en todo el monorepo facilita que cualquier integrante del equipo navegue el código con la misma lógica, sin aprender un estilo distinto por servicio.»

---

### Ítem 18 · Dependencias en configuración

| | |
|--|--|
| **Slide** | **24** — Tecnologías utilizadas |
| **Tiempo** | ~15 s |
| **Pantalla** | Grid Spring Boot, JPA, Flyway, etc. |
| **EN VIVO** | — |
| **Alternativa IDE** | `ms-incidentes/pom.xml` |

**Narración:** «En la slide de tecnologías vemos un stack alineado en todos los microservicios: Spring Boot 4, JPA para persistencia, Flyway para migraciones de base de datos, Eureka Client para registro y Actuator para salud del servicio.

Las versiones están centralizadas en el POM padre del monorepo, de modo que actualizar una dependencia beneficia a todos los módulos a la vez, sin inconsistencias entre servicios.»

---

### Ítem 19 · Funcionamiento de controladores

| | |
|--|--|
| **Slide** | **10** — Patrones de diseño |
| **Tiempo** | ~20 s |
| **Pantalla** | Diagrama State + nota Factory |
| **EN VIVO** | — |
| **Alternativa IDE** | `IncidenteController.java` |

**Narración:** «Los controladores REST reciben las peticiones HTTP y delegan la lógica al service correspondiente, devolviendo DTOs — objetos de transferencia de datos — en lugar de exponer entidades internas. Al crear un incidente respondemos con código 201; para consultar correlaciones usamos GET, siguiendo la semántica REST.

La documentación OpenAPI está disponible en `/v3/api-docs`, lo que permite a cualquier integrador entender los contratos sin leer el código fuente.»

---

### Ítem 20 · Seguridad en microservicios

| | |
|--|--|
| **Slide** | **18** — Seguridad |
| **Tiempo** | ~15 s |
| **Pantalla** | Chips: perímetro Gateway, `/api/public/**` |
| **EN VIVO** | — |
| **Alternativa IDE** | `api-gateway/.../application.yml` |

**Narración:** «La seguridad está concentrada en el Gateway, no replicada en cada microservicio, como indican los chips de esta slide. Los microservicios viven en una red interna y no están expuestos directamente a internet.

Solo el portal ciudadano accede por rutas públicas acotadas, bajo el prefijo `/api/public/**`, mientras que el resto de operaciones exige autenticación previa en el perímetro.»

---

### Ítem 21 · Patrones aplicados y dónde en código

| | |
|--|--|
| **Slide** | **10** + **19** |
| **Tiempo** | ~30 s |
| **Pantalla** | State en slide 10; Circuit Breaker en slide 19 |
| **EN VIVO** | — |
| **Alternativa IDE** | `IncidentStateFactory`, `FakeWeatherAdapter`, `DashboardFacadeService` |

**Narración:** «En la slide 10 vemos el patrón State con Factory para gestionar los estados de un incidente; en la slide 19, el Circuit Breaker que protege al BFF ante fallos externos. Además aplicamos Adapter para integrar datos de clima y Facade en el BFF para agregar el dashboard.

Cada patrón responde a una necesidad concreta del negocio, no es decoración: State controla transiciones válidas, Adapter aísla servicios externos y Circuit Breaker evita que un fallo en cascada bloquee al operador.»

---

### Ítem 22 · Archivos de configuración

| | |
|--|--|
| **Slide** | **20** — Persistencia y base de datos |
| **Tiempo** | ~15 s |
| **Pantalla** | Tres BD aisladas en diagrama |
| **EN VIVO** | — |
| **Alternativa IDE** | `ms-incidentes/.../application.properties` |

**Narración:** «Cada microservicio tiene su propio archivo `application.properties` con puerto, conexión a PostgreSQL, configuración de Flyway y registro en Eureka. En el diagrama de esta slide vemos las tres bases de datos aisladas, una por dominio.

También definimos perfiles `docker` y `test` para separar la configuración de despliegue en contenedores de la usada en pruebas automatizadas, sin mezclar entornos.»

---

### Ítem 23 · Levantar microservicio y comprobar

| | |
|--|--|
| **Slide** | **21** — Observabilidad |
| **Tiempo** | ~15 s |
| **Pantalla** | Flujo Actuator → Eureka → SBA |
| **EN VIVO** | Eureka MS-INCIDENTES UP o `/actuator/health` (5 s) |
| **Alternativa IDE** | — |

**Narración:** «Para comprobar que un microservicio funciona usamos una verificación doble, como muestra el flujo de esta slide. Primero confirmamos que aparece registrado en Eureka con estado UP; además consultamos su endpoint `/actuator/health` para validar que la aplicación responde correctamente.

Esa combinación nos da observabilidad operativa desde el primer día: sabemos no solo que el proceso está vivo, sino que la base de datos y las dependencias internas también están sanas.»

---

### Ítem 24 · Manejo de excepciones

| | |
|--|--|
| **Slide** | **10** |
| **Tiempo** | ~15 s |
| **Pantalla** | Nota reglas de negocio en slide 10 |
| **EN VIVO** | — |
| **Alternativa IDE** | `ApiExceptionHandler.java` |

**Narración:** «Los errores se gestionan de forma centralizada mediante un manejador global de excepciones. Si se viola una regla de negocio, devolvemos un mensaje claro; si falla la validación de entrada, respondemos con código 400; si no existe el recurso, con 404.

Todas las respuestas de error son JSON legible, sin stack traces expuestos al cliente, lo que protege información interna y facilita la comprensión al operador o al integrador.»

---

### Ítem 25 · Buenas prácticas en microservicios

| | |
|--|--|
| **Slide** | **10** |
| **Tiempo** | ~15 s |
| **Pantalla** | Tabla patrones slide 10 |
| **EN VIVO** | — |
| **Alternativa IDE** | `@Valid` en `IncidenteController` |

**Narración:** «Seguimos buenas prácticas de microservicios en todo el proyecto, reflejadas en la tabla de patrones de esta slide. Usamos DTOs en la frontera de la API, validación con anotaciones como `@Valid`, códigos HTTP con significado semántico y migraciones versionadas con Flyway.

La lógica crítica cuenta con tests automatizados, de modo que un cambio en el ciclo de vida de incidentes o en asignaciones de recursos se verifica antes de llegar a producción.»

---

### Ítem 26 · Circuit Breaker — configuración

| | |
|--|--|
| **Slide** | **19** — Continuidad operacional y resiliencia |
| **Tiempo** | ~25 s |
| **Pantalla** | Diagrama BFF → CB → fallback → `degraded: true` |
| **EN VIVO** | — |
| **Alternativa IDE** | `bff-rev/.../application.properties` resilience4j |

**Narración:** «En la slide 19 vemos cómo Resilience4j implementa el Circuit Breaker en el BFF. Si el microservicio de zonas deja de responder, el BFF activa un fallback con datos en caché y marca la respuesta con `degraded: true`, lo que dispara un aviso naranja en la interfaz.

El operador mantiene continuidad con información parcial y sabe de forma transparente que no todos los datos están actualizados, en lugar de recibir un error opaco.»

---

### Ítem 27 · Buenas prácticas HTTP status

| | |
|--|--|
| **Slide** | **18** |
| **Tiempo** | ~15 s |
| **Pantalla** | Secuencia login slide 18 |
| **EN VIVO** | — |
| **Alternativa IDE** | `@ResponseStatus(CREATED)` |

**Narración:** «Usamos códigos HTTP con significado claro en toda la API, como muestra la secuencia de login en esta slide. Devolvemos 201 al crear un recurso, 401 cuando falta o es inválido el token, y 503 si el servicio de autenticación no está disponible.

Esa semántica REST consistente permite al frontend y a los integradores reaccionar de forma predecible ante cada situación, sin interpretar mensajes ambiguos.»

---

### Ítem 28 · Log interno

| | |
|--|--|
| **Slide** | **21** |
| **Tiempo** | ~10 s |
| **Pantalla** | Chip Actuator / roadmap ELK |
| **EN VIVO** | — |
| **Alternativa IDE** | `logging.level.*` en properties |

**Narración:** «Cada microservicio escribe logs internos que podemos consultar desde la consola de Maven durante el desarrollo o con `docker logs` en contenedores. En operaciones críticas — como cambios de estado de un incidente — esos registros permiten trazar qué ocurrió y cuándo.

En esta slide también vemos el roadmap hacia una solución ELK para centralizar logs en producción, aunque hoy cubrimos EVA3 con la trazabilidad básica de consola.»

---

### Ítem 29 · Métricas internas

| | |
|--|--|
| **Slide** | **21** |
| **Tiempo** | ~15 s |
| **Pantalla** | Actuator + SBA en diagrama |
| **EN VIVO** | http://localhost:18099 — apps UP (10 s) |
| **Alternativa IDE** | `/actuator/health` |

**Narración:** «Spring Boot Actuator expone métricas y salud en cada microservicio, como indica el diagrama de esta slide. Spring Boot Admin — SBA — consolida esa información en un panel único donde vemos de un vistazo qué aplicaciones están UP o DOWN.

En el roadmap evolutivo contemplamos Prometheus y Grafana para alertas y dashboards más avanzados, pero hoy SBA nos da la visibilidad necesaria para esta evaluación.»

---

### Ítem 30 · Pruebas realizadas

| | |
|--|--|
| **Slide** | **35** — Resultados obtenidos |
| **Tiempo** | ~20 s |
| **Pantalla** | KPIs técnicos en slide 35 |
| **EN VIVO** | — |
| **Alternativa IDE** | `ms-incidentes/src/test/` · `informe-pruebas-eva3.md` |

**Narración:** «Las pruebas cubren lógica unitaria e integración en los microservicios, y los KPIs técnicos de la slide 35 reflejan esa cobertura. Según `informe-pruebas-eva3.md`, alcanzamos al menos un 80 % de cobertura con JaCoCo en los módulos críticos.

Mi compañero Nicolás Barra muestra la ejecución de esos tests y la demo operativa en sus videos complementarios del equipo.»

---

## Bloque D — Seguridad (ítems 31–35)

> Slide principal: **18** · opcional **17** (roles)

### Ítem 31 · Justificación de seguridad

| | |
|--|--|
| **Slide** | **18** |
| **Tiempo** | ~20 s |
| **Pantalla** | Secuencia login completa |
| **EN VIVO** | — |

**Narración:** «La seguridad es prioritaria porque REV maneja datos sensibles de ciudadanos y coordina operaciones críticas en emergencias. Keycloak centraliza la gestión de usuarios y roles; los tokens JWT permiten escalar sin mantener sesiones en memoria en cada servicio.

Como muestra la secuencia de login en esta slide, el Gateway es el único punto expuesto hacia el exterior: todo el tráfico pasa por ahí antes de llegar al BFF o a los microservicios internos.»

---

### Ítem 32 · Cómo se genera el JWT

| | |
|--|--|
| **Slide** | **18** |
| **Tiempo** | ~20 s |
| **Pantalla** | Flechas FE → GW → KC → token |
| **EN VIVO** | — |
| **Alternativa IDE** | `AuthController.java` |

**Narración:** «El flujo de autenticación comienza en React: el operador ingresa sus credenciales y la petición viaja al Gateway, que la reenvía al adaptador de autenticación y de ahí a Keycloak, en el realm `rev`. Si las credenciales son válidas, Keycloak devuelve un token JWT que el frontend guarda y envía en cada petición posterior.

Como muestran las flechas de esta slide, el token acompaña todas las llamadas autenticadas, sin necesidad de volver a pedir usuario y contraseña en cada acción.»

---

### Ítem 33 · Cómo se configura el JWT

| | |
|--|--|
| **Slide** | **18** + **17** |
| **Tiempo** | ~20 s |
| **Pantalla** | Chips IAM / roles slide 18; tabla roles slide 17 |
| **EN VIVO** | — |
| **Alternativa IDE** | Keycloak :18090 · adapter properties |

**Narración:** «En Keycloak configuramos el realm `rev` con tres roles principales: Despachador, Brigadista y Admin, que vemos en la slide 17 junto con sus permisos. El Gateway exige el header `Authorization: Bearer` seguido del token en todas las rutas protegidas.

Esa configuración centralizada evita duplicar reglas de acceso en cada microservicio: definimos quién puede hacer qué una sola vez, y el Gateway aplica la política de forma uniforme.»

---

### Ítem 34 · Cómo se valida el JWT

| | |
|--|--|
| **Slide** | **18** |
| **Tiempo** | ~20 s |
| **Pantalla** | Chip AuthenticationFilter |
| **EN VIVO** | — |
| **Alternativa IDE** | `AuthenticationFilter.java` |

**Narración:** «El Gateway valida cada token JWT mediante el filtro de autenticación que aparece como chip en esta slide. Comprueba que el token sea válido, no haya expirado y que el rol del usuario tenga permiso para la ruta solicitada; si falta el token, responde con 401 de inmediato.

Una vez validado, el contexto de identidad — quién es el usuario y qué rol tiene — se propaga al BFF para que las operaciones queden trazadas y autorizadas de extremo a extremo.»

---

### Ítem 35 · Enrutamiento con seguridad

| | |
|--|--|
| **Slide** | **9** — fila API Gateway |
| **Tiempo** | ~20 s |
| **Pantalla** | Tabla patrones: Gateway, BFF, rutas |
| **EN VIVO** | — |
| **Alternativa IDE** | `api-gateway/.../application.yml` |

**Narración:** «El enrutamiento con seguridad combina rutas abiertas y protegidas, como indica la fila API Gateway en la tabla de patrones de esta slide. Las rutas `/api/public/**` y `/auth/**` no requieren login — son para el portal ciudadano y el flujo de autenticación — mientras que `/api/**` exige token válido antes de llegar al BFF.

Todo el tráfico externo entra por un único puerto, el 18080, lo que simplifica el firewall y concentra las políticas de seguridad en un solo lugar.»

---

## Bloque E — API Gateway (ítems 36–38)

> Slides: **6** + **18** + **9**

### Ítem 36 · Funcionamiento API Gateway

| | |
|--|--|
| **Slide** | **6** |
| **Tiempo** | ~20 s |
| **Pantalla** | Gateway en diagrama de capas |
| **EN VIVO** | — |
| **Alternativa IDE** | `application.yml` |

**Narración:** «El API Gateway es la única entrada para el frontend React, como se ve en el diagrama de capas de esta slide. Concentra en un solo componente la seguridad, el rate limiting del portal ciudadano y el enrutamiento hacia el BFF y el adaptador de autenticación.

Gracias a Eureka, el Gateway no necesita conocer direcciones fijas: resuelve dinámicamente dónde está el BFF en cada momento y reenvía las peticiones de forma transparente.»

---

### Ítem 37 · Componentes del Gateway

| | |
|--|--|
| **Slide** | **18** |
| **Tiempo** | ~15 s |
| **Pantalla** | Chips perímetro, JWT, filtro |
| **EN VIVO** | — |
| **Alternativa IDE** | paquete `gateway/filter/` |

**Narración:** «Los componentes del Gateway cubren todo el perímetro de seguridad, como muestran los chips de esta slide. Incluye autenticación y validación JWT, rate limiting para proteger el portal público, decodificador de tokens y configuración CORS para permitir peticiones desde Vite en el puerto 15173.

Cada pieza tiene una responsabilidad clara en el paquete `gateway/filter/`, lo que facilita mantener o extender la lógica de filtrado sin tocar el BFF ni los microservicios.»

---

### Ítem 38 · Cómo filtra peticiones

| | |
|--|--|
| **Slide** | **18** |
| **Tiempo** | ~15 s |
| **Pantalla** | Secuencia autorizado vs rechazado |
| **EN VIVO** | — |
| **Alternativa IDE** | `AuthenticationFilter.java` |

**Narración:** «Cada petición pasa por una cadena de filtros antes de llegar al backend interno, como ilustra la secuencia de autorizado versus rechazado en esta slide. Primero se aplica rate limiting; luego autenticación y validación del token; solo entonces se reenvía al BFF.

Si algo no es válido — token ausente, expirado o rol insuficiente — la petición se detiene en el Gateway y nunca llega a los microservicios, protegiendo la red interna.»

---

## Bloque F — Monitoreo (ítems 39–42)

> Slide **21** · EN VIVO: **SBA**

### Ítem 39 · Justificación monitoreo

| | |
|--|--|
| **Slide** | **21** |
| **Tiempo** | ~15 s |
| **Pantalla** | Diagrama Actuator → SBA |
| **EN VIVO** | http://localhost:18099 (10 s) |

**Narración:** «El monitoreo proactivo es indispensable en una plataforma de emergencias: necesitamos saber al instante si algún servicio deja de responder. Spring Boot Admin consolida la salud de todas las aplicaciones en un panel único, como muestra el diagrama Actuator → SBA de esta slide.

Sin esa visibilidad, un fallo silencioso en un microservicio podría pasar desapercibido mientras el operador intenta coordinar una crisis con datos incompletos.»

---

### Ítem 40 · Acciones si un microservicio falla

| | |
|--|--|
| **Slide** | **19** + **21** |
| **Tiempo** | ~20 s |
| **Pantalla** | CB + degraded en slide 19 |
| **EN VIVO** | — |

**Narración:** «Si un microservicio falla, tenemos una cadena de respuesta coordinada. SBA lo marca como DOWN; Eureka deja de enrutar tráfico hacia esa instancia; el BFF activa modo degradado con la información disponible; y el operador puede seguir gestionando incidentes mientras se reinicia el servicio afectado.

En la slide 19 vemos el Circuit Breaker y el flag `degraded`; en la slide 21, cómo Actuator y SBA detectan el problema antes de que el operador lo note por error en pantalla.»

---

### Ítem 41 · Cómo se entera si falla

| | |
|--|--|
| **Slide** | **21** |
| **Tiempo** | ~15 s |
| **Pantalla** | Chips Actuator + SBA |
| **EN VIVO** | SBA — detalle health (10 s) |

**Narración:** «Nos enteramos de un fallo mediante doble verificación, como indican los chips Actuator y SBA en esta slide. SBA consulta periódicamente el endpoint `/actuator/health` de cada microservicio, y Eureka refleja si la instancia sigue registrada y disponible.

Cuando ambos coinciden en que hay un problema, el equipo puede actuar de inmediato — reiniciar el servicio, revisar logs o escalar — antes de que impacte la operación del despacho.»

---

### Ítem 42 · Seguimiento para mejoras

| | |
|--|--|
| **Slide** | **21** — roadmap Prometheus/ELK |
| **Tiempo** | ~10 s |
| **Pantalla** | Chip Roadmap |
| **EN VIVO** | — |

**Narración:** «Hoy Actuator y SBA cubren los requisitos de observabilidad de EVA3 con salud consolidada y registro dinámico. En el roadmap de esta slide vemos la evolución hacia Prometheus para métricas, alertas automáticas y trazas distribuidas para seguir una petición a través de todos los servicios.

Ese plan de mejora continua nos permitirá detectar tendencias — como aumento de latencia — antes de que se conviertan en fallos visibles para el operador.»

---

## Bloque G — Frontend (ítems 43–52)

> Slides: **13 → 17 → 25 → 15**

### Ítem 43 · Funcionalidad y tecnología elegida

| | |
|--|--|
| **Slide** | **13** — Frontend y experiencia |
| **Tiempo** | ~15 s |
| **Pantalla** | Tabla módulos y rutas |
| **Alternativa IDE** | `package.json` |

**Narración:** «El frontend está construido con React, TypeScript y Vite, con Bootstrap para la interfaz y Leaflet para mapas georreferenciados, como resume la tabla de módulos y rutas de esta slide. Es un stack moderno pensado para un despacho que necesita visualizar incidentes en mapa y tablas en tiempo casi real.

Cada módulo de la interfaz — dashboard, incidentes, correlaciones, mapa — corresponde a una ruta clara que el operador reconoce de inmediato.»

---

### Ítem 44 · Reglas de negocio en frontend

| | |
|--|--|
| **Slide** | **13** |
| **Tiempo** | ~15 s |
| **Pantalla** | Módulos incidentes / correlaciones |
| **Alternativa IDE** | `IncidentesCorrelacionesPanel.tsx` |

**Narración:** «Las reglas de negocio críticas — como qué transiciones de estado son válidas o quién puede cerrar un incidente — viven en el backend, no en el frontend. La interfaz guía al operador mostrando opciones acordes a su rol, pero no inventa permisos ni valida reglas por su cuenta.

En esta slide vemos los módulos de incidentes y correlaciones: el frontend presenta la información y captura acciones, pero la decisión final la toma el microservicio correspondiente.»

---

### Ítem 45 · Buenas prácticas — TypeScript

| | |
|--|--|
| **Slide** | **13** — «Una llamada al BFF» |
| **Tiempo** | ~15 s |
| **Pantalla** | Bullet fetchDashboard |
| **Alternativa IDE** | `api.ts` interfaces |

**Narración:** «Usamos TypeScript con interfaces alineadas a los DTOs que devuelve el BFF, de modo que el compilador detecta inconsistencias antes de ejecutar la aplicación. Los hooks de React encapsulan la lógica de fetching y React Router organiza la navegación entre módulos.

Como indica el bullet «Una llamada al BFF» en esta slide, el contrato tipado entre frontend y backend reduce errores de integración y facilita el mantenimiento cuando evoluciona la API.»

---

### Ítem 46 · Seguridad y cambios ante solicitudes

| | |
|--|--|
| **Slide** | **17** — Roles y permisos |
| **Tiempo** | ~15 s |
| **Pantalla** | Matriz rol → permiso |
| **Alternativa IDE** | `useAuth.ts`, `App.tsx` guards |

**Narración:** «La seguridad en el frontend se apoya en el token JWT que se adjunta a cada llamada al API. Los menús y acciones visibles dependen del rol del usuario — Despachador, Brigadista o Admin — según la matriz rol → permiso de esta slide.

Los guards de React Router bloquean rutas no autorizadas antes de renderizar el componente, pero la fuente de verdad de permisos sigue estando centralizada en Keycloak, no en lógica dispersa por la interfaz.»

---

### Ítem 47 · Petición sin respuesta

| | |
|--|--|
| **Slide** | **19** — UX degradado |
| **Tiempo** | ~15 s |
| **Pantalla** | Chip UX información parcial |
| **Alternativa IDE** | `StateView.tsx` |

**Narración:** «Cuando una petición no recibe respuesta — por timeout o fallo de red — la interfaz muestra un mensaje claro al operador en lugar de dejar la pantalla colgada. El componente ofrece opción de reintento y explica que la información puede estar incompleta, como indica el chip de UX en la slide 19.

El operador entiende qué está pasando y puede decidir si reintenta o continúa con los datos que ya tiene cargados, sin perder el contexto del despacho.»

---

### Ítem 48 · Tiempos de respuesta

| | |
|--|--|
| **Slide** | **25** — Flujo funcional |
| **Tiempo** | ~15 s |
| **Pantalla** | Secuencia GET /api/dashboard |
| **Alternativa IDE** | DevTools Network |

**Narración:** «El dashboard se carga con una sola llamada al BFF — `GET /api/dashboard` — como muestra la secuencia funcional de esta slide. Eso reduce la latencia respecto a hacer cinco o seis peticiones independientes a distintos microservicios desde el navegador.

Si algún microservicio no responde, el BFF devuelve la respuesta en modo degradado y la interfaz lo refleja con un aviso, manteniendo tiempos de respuesta aceptables incluso bajo presión.»

---

### Ítem 49 · Estándares rendimiento y disponibilidad UI

| | |
|--|--|
| **Slide** | **15** — Capturas operativas |
| **Tiempo** | ~15 s |
| **Pantalla** | Screenshots dashboard / mapa |
| **Alternativa IDE** | localhost:15173 |

**Narración:** «En las capturas de esta slide vemos el dashboard operativo y el mapa con Leaflet cargando de forma fluida. La interfaz prioriza carga ágil y respuesta inmediata a las acciones del operador, porque en emergencias cada segundo cuenta.

Ante fallos parciales, el componente DegradedAlert informa con un banner visible — nunca dejamos al operador frente a una pantalla en blanco sin explicación.»

---

### Ítem 50 · Log interno frontend

| | |
|--|--|
| **Slide** | **13** |
| **Tiempo** | ~10 s |
| **Pantalla** | Mencionar DevTools en voz |
| **Alternativa IDE** | F12 Console |

**Narración:** «Durante el desarrollo, los logs del frontend se consultan en la consola del navegador con las herramientas de desarrollo — F12 — para depurar peticiones, errores de renderizado o problemas de autenticación. En producción, el plan es integrar un servicio como Sentry para capturar errores de forma centralizada.

Esa trazabilidad complementa los logs del backend y ayuda a reproducir incidencias reportadas por el operador.»

---

### Ítem 51 · Mensajes concordantes con negocio

| | |
|--|--|
| **Slide** | **19** — UX información parcial |
| **Tiempo** | ~15 s |
| **Pantalla** | Callout despachador mantiene visibilidad |
| **Alternativa IDE** | `DegradedAlert.tsx` |

**Narración:** «Los mensajes que ve el operador están redactados en español claro y alineados al lenguaje del negocio municipal. Cuando la información está incompleta, mostramos «Información parcial» con el callout de esta slide: el despachador mantiene visibilidad sin interrumpir la operación.

Preferimos ser honestos sobre lo que falta — por ejemplo, datos de zonas no actualizados — en lugar de ocultar el problema o mostrar un error técnico incomprensible.»

---

### Ítem 52 · Manejo de excepciones frontend

| | |
|--|--|
| **Slide** | **15** o **13** |
| **Tiempo** | ~15 s |
| **Pantalla** | Capturas de estados de UI |
| **Alternativa IDE** | `StateView.tsx`, `api.ts` 401/403/5xx |

**Narración:** «El frontend maneja las excepciones HTTP con acciones concretas para cada código, visibles en las capturas de estados de UI de esta slide. Ante un 401 redirigimos al login; ante un 403 mostramos que no hay permiso para esa acción; ante un 5xx ofrecemos reintentar con un mensaje comprensible.

Esas respuestas claras facilitan la evaluación y la operación diaria: el operador sabe qué hacer en cada situación sin interpretar códigos técnicos.»

---

## Bloque H — Cierre (puente a pruebas)

| | |
|--|--|
| **Slide** | **36** (Conclusiones) → **35** (Resultados) → **38** (cierre) |
| **Tiempo** | ~30 s |
| **Pantalla** | KPIs slide 35; mensaje cierre slide 36; logo slide 38 |
| **EN VIVO** | — |
| **Alternativa IDE** | `docs/informe-evidencias/eva3/` |

**Narración:** «REV integra microservicios por área de negocio, autenticación con Keycloak, un Gateway como único punto de entrada, un BFF que agrega el dashboard y monitoreo con Actuator y Spring Boot Admin. Los KPIs de la slide 35 confirman que la arquitectura está respaldada por pruebas documentadas en `informe-pruebas-eva3.md`. La slide 36 resume las conclusiones del proyecto; cerramos en la slide 38 con el lema institucional.

Mi compañero Nicolás complementa este video con la demo operativa y la ejecución de tests. Gracias por su atención.»

---

## Checklist final Giannina

- [ ] Ítems 1–52 narrados (slides + narración completa)
- [ ] Eureka y SBA mostrados en vivo
- [ ] Patrones en slides **10**, **11**, **19** (o IDE si sobra tiempo)
- [ ] Seguridad JWT en slide **18**
- [ ] Frontend en slides **13** / **15** (o `api.ts` opcional)
- [ ] Mención `informe-pruebas-eva3.md` y JaCoCo
- [ ] Duración 18–22 min
- [ ] Audio claro; ritmo pausado — lee la narración tal como está escrita

---

## URLs y puertos (entorno local)

| Servicio | URL |
|----------|-----|
| Frontend (Vite) | http://localhost:15173 |
| API Gateway | http://localhost:18080 |
| Eureka | http://localhost:18761 |
| Keycloak | http://localhost:18090 |
| Spring Boot Admin | http://localhost:18099 |
| ms-incidentes (health) | http://localhost:18081/actuator/health |

---

## Referencias rápidas

| Tema | Ruta |
|------|------|
| Presentación EVA3 | `docs/informe-evidencias/eva3/Presentacion-REV-EVA3.pdf` |
| Presentación HTML | `docs/informe-evidencias/eva3/Presentacion-REV-EVA3.html` |
| Arquitectura | `docs/patrones-y-arquitectura-rev.md` |
| Informe EVA3 | `docs/informe-evidencias/eva3/informe-pruebas-eva3.md` |
| Eureka | `infraestructuredomain/eureka-server/` |
| Gateway | `infraestructuredomain/api-gateway/` |
| BFF | `infraestructuredomain/bff-rev/` |
| Frontend | `frontend/rev-dashboard/` |
