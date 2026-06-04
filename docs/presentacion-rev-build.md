---
marp: true
title: REV — Red de Emergencia Valle
description: Segunda entrega EVA2 — DSY1106 — Informe técnico integral y defensa oral
author: Nicolás Barra, Giannina Guerrero
theme: rev-dark
paginate: true
size: 16:9
mermaid: |
  theme: base
  themeVariables:
    darkMode: true
    background: transparent
    primaryColor: '#142c4e'
    primaryTextColor: '#ffffff'
    primaryBorderColor: '#f97316'
    secondaryColor: '#10233e'
    secondaryTextColor: '#a7b4c7'
    secondaryBorderColor: 'rgba(255,255,255,0.12)'
    tertiaryColor: '#0b172a'
    tertiaryTextColor: '#a7b4c7'
    tertiaryBorderColor: 'rgba(255,255,255,0.08)'
    lineColor: '#73839a'
    textColor: '#a7b4c7'
    mainBkg: '#10233e'
    nodeBorder: '#f97316'
    clusterBkg: '#0b172a'
    clusterBorder: 'rgba(249,115,22,0.35)'
    titleColor: '#ffffff'
    edgeLabelBackground: '#07111f'
    fontFamily: 'Inter, Segoe UI, sans-serif'
style: |
  @import url('presentacion-rev-theme.css');
  pre[is='marp-pre'], pre[data-auto-scaling], code.language-mermaid {
    background: #07111f !important;
    color: #a7b4c7 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
  }
---

<!-- _class: lead -->

<div class="rev-hero">

<img class="rev-hero__logo" src="../frontend/rev-dashboard/public/assets/logos/emblem-color.png" width="88" alt="REV" />

# RED DE EMERGENCIA VALLE

## REV — Municipalidad de Valle del Sol

<p class="tagline">Conectividad que salva vidas</p>

<p class="subtitle">Innovación que resguarda el mañana · DSY1106 EVA2 · Mayo 2026</p>

<div class="rev-meta-row">
<span class="rev-badge">Nicolás Barra</span>
<span class="rev-badge">Giannina Guerrero</span>
<span class="rev-badge">Prof. Israel Alejandro Villagra Riquelme</span>
</div>

<div class="rev-hero__card rev-callout">

Plataforma de **misión crítica** en microservicios Spring Cloud. Esta presentación resume el **informe técnico integral** con evidencias en código, capturas del dashboard y arquitectura desplegada en Docker.

</div>

</div>

<!--
Notas del expositor:
Abrir con el lema institucional. REV no es solo un proyecto académico: responde a un problema real de gestión de emergencias en Valle del Sol. Mencionar que todo lo que verán está verificado en el repositorio rev-fullstack.
Posible pregunta: «¿Por qué microservicios y no un monolito?» → Picos de demanda en crisis, despliegue independiente por dominio, resiliencia perimetral.
-->

---

<!-- _class: dense -->

# Entregables EVA2 — Segunda evaluación

## Documentación e implementación alineada al informe integral

<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi">
<span class="rev-kpi__label">Informe integral</span>
<span class="rev-kpi__value">14 capítulos · fig. 1–20</span>
<span class="rev-kpi__meta">informe-tecnico-integral-rev.html</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Ecosistema</span>
<span class="rev-kpi__value">BFF + 3 MS + Gateway</span>
<span class="rev-kpi__meta">Keycloak · Eureka · Docker</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Frontend</span>
<span class="rev-kpi__value">Dashboard operacional</span>
<span class="rev-kpi__meta">frontend/rev-dashboard/</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Arquetipo</span>
<span class="rev-kpi__value">Maven custom</span>
<span class="rev-kpi__meta">rev-microservice-archetype/</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Evidencias</span>
<span class="rev-kpi__value">Capturas UX + código</span>
<span class="rev-kpi__meta">docs/informe-evidencias/</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Git + CI</span>
<span class="rev-kpi__value">main / dev</span>
<span class="rev-kpi__meta">commits [ TIPO ]: · GitHub Actions</span>
</div>

</div>

<div class="rev-callout">

**Metodología:** cada afirmación del informe se vincula a archivos del monorepo. Las figuras 14–16b son **screenshots reales** con datos del stack local.

</div>

</div>

---

# Problema identificado

## ¿Por qué es necesario REV?

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div markdown="1" class="rev-stack">

<p>Los municipios enfrentan <strong>picos impredecibles de demanda</strong> durante incendios, incidentes urbanos y emergencias estructurales.</p>

<div class="rev-panel" markdown="1">

| Limitación | Impacto |
|------------|---------|
| Acoplamiento monolítico | Un fallo tumba todo |
| Escalado uniforme | No prioriza incidentes |
| Interfaces fragmentadas | Despachador pierde tiempo |
| Canales ciudadanos lentos | Demora activación brigadas |

</div>

<blockquote>El problema no es «falta de software», sino <strong>arquitectura no adaptable</strong> a la urgencia municipal.</blockquote>

</div>


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-01.svg" alt="Diagrama REV 01" /></div>


</div>

<!--
Notas del expositor:
Conectar con el informe-sistema-rev.md §1: modelos monolíticos no absorben picos. Ejemplo concreto: durante un incendio forestal en zona metropolitana + reportes costeros simultáneos.
Pregunta probable: «¿Qué pasa si cae un servicio?» → Anticipar slide 16 (Circuit Breaker + degraded).
-->

---

<!-- _class: dense -->

# Objetivos del proyecto

## Alineación objetivo ↔ arquitectura

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Tipo | Objetivo | Componente que lo materializa |
|------|----------|-------------------------------|
| **General** | Plataforma integral de gestión de emergencias municipales | Monorepo: React + Gateway + BFF + 3 MS |
| **Específico 1** | Gestionar ciclo de vida de incidentes con reglas de negocio | `ms-incidentes` + Factory/State |
| **Específico 2** | Evaluar riesgo territorial por coordenadas | `ms-zonas-riesgo` + PostGIS |
| **Específico 3** | Coordinar brigadas, vehículos y herramientas | `ms-recursos` + asignación vía BFF |
| **Específico 4** | Vista unificada para el despachador | `bff-rev` + `DashboardFacadeService` |
| **Específico 5** | Canal ciudadano sin autenticación | Portal `/portal` + `POST /api/public/incidentes` |

</div>

<div class="rev-callout">

Cada objetivo específico corresponde a un **bounded context** con base de datos propia. El BFF agrega; los MS deciden.

</div>

</div>

<!--
Notas del expositor:
Enfatizar trazabilidad objetivo → microservicio. EVA2 exige BFF + 2 MS + arquetipos: REV entrega BFF + 3 MS + arquetipo Maven custom.
Pregunta: «¿Dónde está la transición de estados en UI?» → Backend completo (PUT transicion); UI aún solo visualiza — gap documentado en informe §6.
-->

---

<!-- _class: diagram -->

# Visión general de REV

## Propósito, actores y dominios

<div markdown="1" class="slide-workspace rev-split rev-split--35-65">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Actor | Rol |
|-------|-----|
| Despachador | Crea incidentes, asigna recursos |
| Brigadista | Consulta estado y riesgo |
| Administrador | Operación + Keycloak |
| Ciudadano | Reporta vía portal público |

</div>

<div class="rev-callout">Tres dominios <strong>sin BD compartida</strong>. El BFF entrega <code>DashboardResponse</code> unificado.</div>

</div>


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-02.svg" alt="Diagrama REV 02" /></div>


</div>

<!--
Notas del expositor:
Explicar interacción: al listar incidentes, el BFF enriquece cada uno con nivel de riesgo (coordenadas → ms-zonas) y recursos asignados (ms-recursos).
Pregunta: «¿Por qué separar recursos de incidentes?» → Diferente ritmo de cambio, equipos distintos, escalado independiente (DDD).
-->

---

<!-- _class: diagram -->

# Arquitectura general

## Ecosistema verificado en el monorepo


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-03.svg" alt="Diagrama REV 03" /></div>


<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--2">

<div class="rev-kpi"><span class="rev-kpi__label">Perímetro</span><span class="rev-kpi__value">Gateway + JWT</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Datos</span><span class="rev-kpi__value">3 BD aisladas</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Discovery</span><span class="rev-kpi__value">Eureka lb://</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Monitor</span><span class="rev-kpi__value">SBA :8099</span></div>

</div>

</div>

<!--
Notas del expositor:
Recorrer capas: cliente → perímetro → orquestación → dominio → datos. Puerto único de entrada para el frontend: 8080 (Gateway). Vite proxy en dev.
Pregunta: «¿Por qué Keycloak Adapter y no JWT directo en Gateway?» → Separación de responsabilidades; adapter valida RSA256 con JWK del realm rev.
-->

---

<!-- _class: dense -->

# Microservicios implementados

## Responsabilidad, datos y beneficio de la separación

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Microservicio | Puerto | BD | Responsabilidad |
|---------------|--------|-----|-----------------|
| **ms-incidentes** | 8081 | `rev_incidentes` | Ciclo de vida del incidente |
| **ms-zonas-riesgo** | 8082 | `rev_zonas` | Territorio y evaluación de riesgo |
| **ms-recursos** | 8083 | `rev_recursos` | Logística operacional |

</div>

<div markdown="1" class="rev-split">

<div class="rev-card">

### ms-incidentes
Reglas de transición encapsuladas (Factory + State). Cambios en estados no afectan zonas ni recursos.

</div>

<div class="rev-card">

### ms-zonas-riesgo
PostGIS + adaptador climático (`WeatherDataPort`). Evolución territorial sin tocar incidentes.

</div>

</div>

<div class="rev-callout">

**ms-recursos:** asignaciones con `incidente_id` UUID — desacoplamiento cross-service sin FK entre bases de datos.

</div>

</div>

<!--
Notas del expositor:
Cada MS tiene Flyway, Actuator, springdoc-openapi, Eureka client. ddl-auto=validate en los tres.
Pregunta: «¿Cómo se comunican?» → REST síncrono vía WebClient en BFF con nombres Eureka MS-INCIDENTES, etc.
-->

---

<!-- _class: diagram -->

# Infraestructura de plataforma

## Componentes transversales del ecosistema

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div class="rev-panel" markdown="1">

| Componente | Función |
|------------|---------|
| **Docker Compose** | 12 servicios reproducibles |
| **Eureka :8761** | Service discovery |
| **Keycloak :8090** | IAM realm `rev` |
| **SBA :8099** | Salud centralizada |

</div>

<div markdown="1" class="rev-stack">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-04.svg" alt="Diagrama REV 04" /></div>


<div class="rev-callout">Arranque: <code>.\scripts\dev-up.ps1 -DockerApps</code></div>

</div>

</div>

<!--
Notas del expositor:
Mencionar orden de dependencias en compose: BD/Keycloak → Eureka → SBA → MS → BFF → Gateway.
Pregunta: «¿Por qué JRE Alpine 21?» → Imágenes livianas, alineado a sostenibilidad documentada en informe §2.2.
-->

---

<!-- _class: dense -->

# Patrones arquitectónicos

## De la teoría a la implementación REV

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Patrón | Aplicación en REV | Beneficio |
|--------|-------------------|-----------|
| **Microservices** | 3 MS + BFF + Gateway | Escalado independiente |
| **API Gateway** | `api-gateway` :8080 | Seguridad centralizada |
| **BFF** | `DashboardFacadeService` | Una llamada al dashboard |
| **Service Discovery** | Eureka + `lb://BFF-REV` | Sin hardcodear hosts |
| **Circuit Breaker** | Resilience4j en BFF | Operación parcial ante fallos |
| **Database per Service** | 3 PostgreSQL/PostGIS | Autonomía de datos |

</div>

<div class="rev-callout">

**Cache-aside:** `ZonaRiesgoCache` sirve datos de riesgo cuando `ms-zonas-riesgo` no responde.

</div>

</div>

<!--
Notas del expositor:
Diferenciar patrón arquitectónico (estilo del sistema) vs patrón de diseño (clase Java). Gateway Filter = AuthenticationFilter.java.
Pregunta: «¿Endpoint público sin JWT?» → /api/public/** para portal ciudadano; ruta sin AuthenticationFilter en application.yml.
-->

---

<!-- _class: diagram dense -->

# Patrones de diseño implementados

## Trazabilidad clase → problema → beneficio


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-05.svg" alt="Diagrama REV 05" /></div>


<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Patrón | Implementación |
|--------|----------------|
| **Factory + State** | `IncidentStateFactory` |
| **Adapter** | `FakeWeatherAdapter` |
| **Facade** | `DashboardFacadeService` |
| **Repository** | Spring Data JPA |

</div>

<div class="rev-callout"><code>ReportadoState</code> exige georreferenciación para pasar a <code>EN_PROGRESO</code>.</div>

</div>

</div>

<!--
Notas del expositor:
Mostrar en IDE IncidentStateFactory si hay proyector. Enfatizar doble patrón Factory+State en ms-incidentes.
Pregunta: «¿FakeWeatherAdapter es un hack?» → No; es adaptador consciente para demo; puerto permite IoT futuro (documentado §10.3 informe).
-->

---

<!-- _class: diagram -->

# Arquetipos utilizados

## Estructura reutilizable del monorepo


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-06.svg" alt="Diagrama REV 06" /></div>


<div markdown="1" class="slide-workspace rev-split">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Capa | Ejemplo |
|------|---------|
| Controller | `IncidenteController` |
| Service | `IncidenteService` |
| Repository | `IncidenteRepository` |

</div>

<div class="rev-callout">Estandariza nuevos MS municipales sin reconfigurar Eureka, Actuator ni Flyway.</div>

</div>

</div>

<!--
Notas del expositor:
Los 3 MS actuales fueron implementados manualmente pero replican el arquetipo. Comando mvn archetype:generate documentado en patrones-y-arquitectura-rev.md §3.2.
Pregunta EVA2: «¿Cuántos arquetipos Maven?» → Uno custom en archetypes/; estructura de capas como arquetipo organizacional.
-->

---

<!-- _class: diagram -->

# DDD y Bounded Contexts

## Tres subdominios = tres microservicios autónomos


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-07.svg" alt="Diagrama REV 07" /></div>


<div markdown="1" class="slide-workspace rev-split rev-split--65-35">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Ventaja | Ejemplo REV |
|---------|-------------|
| Lenguaje ubicuo | «Estado» vs «Nivel» |
| Evolución independiente | CRUD zonas sin migrar incidentes |
| Fallas contenidas | Circuit Breaker por MS |

</div>

<div class="rev-callout">Contrato UI: <code>{ incidente, zonaRiesgo, recursos, degraded }</code></div>

</div>

</div>

<!--
Notas del expositor:
Asignacion.incidente_id es UUID sin FK cross-DB — integración eventual, típica en microservicios.
Pregunta: «¿Es DDD completo?» → Bounded contexts sí; agregados simplificados; mejora futura: carpeta domain/ explícita (patrones doc §10).
-->

---

<!-- _class: visual -->

# Frontend y experiencia de usuario

## Módulos operativos verificados en UI

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Módulo | Ruta | Capacidad |
|--------|------|-----------|
| **Inicio** | `/inicio` | KPIs y panorama |
| **Despacho** | `/` | Tabla activos y alertas |
| **Incidentes** | `/incidentes` | Filtros, cards, rail |
| **Zonas** | `/zonas` | Mapa Leaflet |
| **Recursos** | `/recursos` | Brigadas y vehículos |
| **Portal** | `/portal` | Reporte ciudadano |

</div>

<div class="rev-card">

- **Una llamada al BFF** — `fetchDashboard()`
- **ModuleHub** — KPIs + toolbar + rail
- **StateView** — loading / error / empty
- **Lenguaje operacional** — «Con avisos», «Información parcial»

</div>

</div>

<div class="rev-shot">

![width:100%](informe-evidencias/fig14-dispatch.png)

<div class="rev-shot__cap">Fig. 14 — Panel Despacho (`/`)</div>

</div>

</div>

<!--
Notas del expositor:
Demo en vivo recomendada: Inicio → Despacho → Incidentes con filtro alto riesgo → Zonas mapa → Portal reporte.
Pregunta: «¿Brigadista puede crear incidentes?» → No; canManageIncidents solo Admin/Despachador (useAuth.ts).
-->

---

<!-- _class: visual -->

# Reporte público y canal ciudadano

## Integración frontend ↔ BFF ↔ ms-incidentes

<div markdown="1" class="slide-workspace">

<div markdown="1" class="rev-split rev-split--40-60">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Canal | Ruta | Backend |
|-------|------|---------|
| Login — Reportar | `/login` | POST público |
| Portal | `/portal` | Sin registro |
| Despacho | `/api/**` | JWT |

</div>


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-08.svg" alt="Diagrama REV 08" /></div>


</div>

<div markdown="1" class="rev-split">

<div class="rev-shot">

![width:100%](informe-evidencias/fig16-login-reporte.png)

<div class="rev-shot__cap">Fig. 16 — Reporte georreferenciado</div>

</div>

<div class="rev-shot">

![width:100%](informe-evidencias/fig16b-portal.png)

<div class="rev-shot__cap">Fig. 16b — Portal ciudadano</div>

</div>

</div>

</div>

<div class="rev-callout">El reporte público crea incidentes en <code>REPORTADO</code>; el despachador correlaciona y asigna recursos.</div>

</div>

---

<!-- _class: visual -->

# Capturas operativas del sistema

## Evidencias UX integradas al informe (figuras 14–15b)

<div markdown="1" class="slide-workspace rev-split">

<div class="rev-shot">

![width:100%](informe-evidencias/fig15-incidentes.png)

<div class="rev-shot__cap">Incidentes — filtros, listado y rail (`/incidentes`)</div>

</div>

<div class="rev-shot">

![width:100%](informe-evidencias/fig15b-zonas.png)

<div class="rev-shot__cap">Zonas — mapa Leaflet + riesgo territorial (`/zonas`)</div>

</div>

</div>

<p class="rev-caption">Stack Docker local · datos reales · <code>docs/informe-evidencias/</code></p>

---

# Diseño UX/UI y Design System

## Sistema visual monocromático institucional

<div markdown="1" class="slide-workspace rev-split">

<div markdown="1" class="rev-stack">

<div class="rev-deck rev-deck--2">

<div class="rev-kpi"><span class="rev-kpi__label">--rev-bg</span><span class="rev-kpi__value">#07111F</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">--rev-orange</span><span class="rev-kpi__value">#F97316</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">--rev-surface</span><span class="rev-kpi__value">#10233E</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Tipografía</span><span class="rev-kpi__value">Inter · Segoe UI</span></div>

</div>

<div class="rev-panel" markdown="1">

| Componente | Uso en REV |
|------------|------------|
| `RevLogo` | Identidad en shell y login |
| `KpiCard` / `ModuleHub` | Métricas y layout módulo |
| `DegradedAlert` | Modo información parcial |
| `OperationalAmbient` | Fondo cartográfico |

</div>

</div>

<div class="rev-card">

**Principios de diseño**

- Paleta oscura → menos fatiga en sala de despacho
- Naranja único acento → jerarquía clara
- Glass cards + grid 8px → consola operacional
- CSS por módulo: `incidentes.css`, `zonas.css`, `portal.css`

</div>

</div>

<!--
Notas del expositor:
Referenciar theme.css como single source of truth. BootSplash y OperationalAmbient refuerzan identidad REV al arranque.
Pregunta: «¿Accesibilidad?» → Contraste alto, aria-labels en navegación, roles en tabs recursos; weather vía Open-Meteo sin API key.
-->

---

<!-- _class: diagram -->

# Roles y permisos

## Matriz verificada — realm Keycloak `rev`

<div markdown="1" class="slide-workspace rev-split rev-split--65-35">

<div class="rev-panel" markdown="1">

| Acción | Desp. | Brig. | Admin |
|--------|:-----:|:-----:|:-----:|
| Navegación completa | ✓ | ✓ | ✓ |
| Ver módulos operativos | ✓ | ✓ | ✓ |
| **Crear incidente** | ✓ | ✗ | ✓ |
| **Asignar recurso** | ✓ | ✗ | ✓ |
| Consola Keycloak | ✗ | ✗ | ✓ |
| Portal público | ✓ | ✓ | ✓ |

</div>

<div markdown="1" class="rev-stack">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-09.svg" alt="Diagrama REV 09" /></div>


<div class="rev-callout"><code>useAuth.ts</code> · usuarios dev: despachador / brigadista / admin</div>

</div>

</div>

<!--
Notas del expositor:
Seguridad real en Gateway: AuthenticationFilter valida JWT y roles Despachador/Admin/Brigadista. UI oculta botones; Gateway bloquea API.
Pregunta: «¿Por qué Brigadista accede al panel?» → Visibilidad de incidentes activos y recursos; diferencia está en escritura.
-->

---

<!-- _class: diagram -->

# Seguridad

## ¿Cómo protege REV la información?


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-10.svg" alt="Diagrama REV 10" /></div>


<div markdown="1" class="slide-workspace rev-split">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Capa | Mecanismo |
|------|-----------|
| Identidad | Keycloak realm `rev` |
| Token | JWT RSA256 |
| Perímetro | `AuthenticationFilter` |
| Público | `/api/public/**` acotado |

</div>

<div class="rev-callout">Control en Gateway + adapter; MS sin <code>@PreAuthorize</code> (documentado).</div>

</div>

</div>

<!--
Notas del expositor:
Explicar por qué adapter separado: Gateway no implementa lógica OAuth; adapter concentra login, roles, refresh (refresh aún no en UI).
Pregunta: «¿Es seguro el portal público?» → Solo creación de incidente; misma validación de negocio; sin acceso a datos agregados del despacho.
-->

---

<!-- _class: diagram -->

# Continuidad operacional y resiliencia

## ¿Qué ocurre cuando un servicio falla?


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-11.svg" alt="Diagrama REV 11" /></div>


<div markdown="1" class="slide-workspace rev-split rev-split--65-35">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Parámetro | Valor |
|-----------|-------|
| `slidingWindowSize` | 10 |
| `failureRateThreshold` | 50% |
| `waitDurationInOpenState` | 5s |

</div>

<div class="rev-callout">UX: «Información parcial» — el despachador sigue operando con incidentes visibles.</div>

</div>

</div>

<!--
Notas del expositor:
Demo opcional: detener ms-recursos y refrescar dashboard — KPI «Con avisos» sube, DegradedAlert visible.
Pregunta: «¿Por qué no Hystrix?» → Resilience4j 2.2.0 en parent POM; estándar actual Spring Boot 4.
-->

---

<!-- _class: diagram dense -->

# Persistencia y base de datos

## Database per Service + Flyway (informe cap. 11)

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div class="rev-panel" markdown="1">

| MS | Base de datos | Motor |
|----|---------------|-------|
| ms-incidentes | `rev_incidentes` | PostgreSQL 16 |
| ms-zonas-riesgo | `rev_zonas` | PostGIS 16 |
| ms-recursos | `rev_recursos` | PostgreSQL 16 |

</div>

<div markdown="1" class="rev-stack">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-12.svg" alt="Diagrama REV 12" /></div>


<div class="rev-callout"><code>ddl-auto=validate</code> + Flyway · sin FK cross-service entre BD.</div>

</div>

</div>

---

<!-- _class: diagram -->

# Observabilidad y trazabilidad

## Estado actual vs roadmap (informe cap. 10)

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div class="rev-panel" markdown="1">

| Capacidad | Estado |
|-----------|--------|
| Actuator | ✓ Implementado |
| Spring Boot Admin | ✓ :8099 |
| Auditoría negocio | Parcial |
| Logging centralizado | Parcial |
| Prometheus / ELK | Proyección |

</div>

<div markdown="1" class="rev-stack">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-13.svg" alt="Diagrama REV 13" /></div>


<div class="rev-callout"><code>degraded: true</code> conecta resiliencia backend con UX operacional.</div>

</div>

</div>

---

<!-- _class: diagram -->

# Estrategia Git y trabajo colaborativo

## GitFlow simplificado (informe cap. 7)

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div class="rev-panel" markdown="1">

| Rama | Propósito |
|------|-----------|
| `main` | Estable — demo EVA2 |
| `dev` | Integración diaria |
| `feature/*` | PR hacia `dev` |

</div>

<div markdown="1" class="rev-stack">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-14.svg" alt="Diagrama REV 14" /></div>


<div class="rev-callout">Commits atómicos <code>[ TIPO ]:</code> · CI en GitHub Actions</div>

</div>

</div>

---

<!-- _class: dense -->

# Evidencias técnicas del informe

## Galería figuras 1–20 — trazabilidad al repositorio

<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi"><span class="rev-kpi__label">Fig. 1–7</span><span class="rev-kpi__value">Patrones diseño</span><span class="rev-kpi__meta">Cap. 5</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Fig. 8–9</span><span class="rev-kpi__value">Git branching</span><span class="rev-kpi__meta">Cap. 7</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Fig. 10–12</span><span class="rev-kpi__value">Seguridad</span><span class="rev-kpi__meta">Cap. 9</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Fig. 13</span><span class="rev-kpi__value">Flyway SQL</span><span class="rev-kpi__meta">Cap. 11</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Fig. 14–16b</span><span class="rev-kpi__value">Capturas UX</span><span class="rev-kpi__meta">Cap. 12–13</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Fig. 17–20</span><span class="rev-kpi__value">Infra Docker</span><span class="rev-kpi__meta">Cap. 13</span></div>

</div>

<div class="rev-callout">Referencia: <strong>informe-tecnico-integral-rev.html</strong> — diagramas Mermaid, código y paginación PDF.</div>

</div>

---

<!-- _class: dense -->

# Tecnologías utilizadas

## Stack verificado y justificación

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Capa | Tecnología | Detalle |
|------|------------|---------|
| **Frontend** | React + Vite + TS | React 18, Vite 5 |
| **UI** | Bootstrap 5 + Icons | Grid accesible |
| **Mapas** | Leaflet | ZonasPage sin licencias |
| **Backend** | Java 21 + Spring Boot 4 | Spring Cloud 2025.1 |
| **Resiliencia** | Resilience4j 2.2.0 | Circuit Breaker en BFF |
| **BD** | PostgreSQL 16 + PostGIS | 3 bases aisladas |
| **Infra** | Docker Compose | 12 servicios |
| **Seguridad** | Keycloak 24 | realm `rev` |
| **Monitor** | Spring Boot Admin | :8099 vía Eureka |

</div>

</div>

<!--
Notas del expositor:
Monorepo Maven rev-parent centraliza versiones Spring Cloud 2025.1.1. Frontend empaquetado NPM en frontend/rev-dashboard/.
Pregunta: «¿Por qué WebClient y no Feign?» → BFF usa WebClient reactivo con @LoadBalanced — documentado en client services.
-->

---

<!-- _class: diagram -->

# Flujo funcional del sistema

## Recorrido operativo de punta a punta


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-15.svg" alt="Diagrama REV 15" /></div>


<div markdown="1" class="slide-workspace rev-split rev-split--65-35">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Paso | Pantalla |
|------|----------|
| 1 | `LoginPage` |
| 2 | `DashboardPage` |
| 3 | Modal incidentes |
| 4 | `ZonasPage` mapa |
| 5 | Asignar recurso |

</div>

<div class="rev-callout">Ciudadano: <code>PortalPage</code> → POST público sin login.</div>

</div>

</div>

<!--
Notas del expositor:
Recorrer demo en 2 minutos siguiendo la secuencia. Mencionar incidentCreatedTick en UiContext que refresca listas tras crear.
Pregunta: «¿Transición REPORTADO → EN_PROGRESO desde UI?» → No en UI; existe PUT en backend — gap §6.1 informe.
-->

---

# Resultados obtenidos

## Técnicos · Operacionales · Municipales

<div markdown="1" class="slide-workspace rev-split">

<div class="rev-card">

### Resultados técnicos
- Monorepo con 3 MS + BFF + Gateway + IAM
- 6+ patrones de diseño trazables a clases
- Circuit Breaker + cache aside operativos
- Arquetipo Maven custom documentado
- Tests en Factory, zonas y fallbacks BFF
- CI en GitHub Actions (`main`, `dev`)

</div>

<div class="rev-card">

### Resultados operacionales
- Dashboard unificado multi-fuente
- Portal ciudadano sin fricción
- Mapa de zonas de riesgo
- Asignación brigada/vehículo desde UI
- KPIs: activos, alto riesgo, con avisos
- Modo información parcial ante fallos

</div>

</div>

<div class="rev-callout">

**Beneficio municipal:** coordinación más rápida, menor carga cognitiva del despachador y canal vecinal directo con mapa OSM.

</div>

<!--
Notas del expositor:
Relacionar cada resultado con objetivos slide 3. Honestidad académica: gap UI vs backend es fortaleza (consciencia madurez), no debilidad oculta.
Pregunta: «¿Qué falta?» → Transiciones estado UI, CRUD zonas, refresh token — todos listados en informe §10.3.
-->

---

<!-- _class: dense -->

# Conclusiones

## Respuestas técnicas de cierre

<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi">
<span class="rev-kpi__label">Solución moderna</span>
<span class="rev-kpi__value">Microservicios reales</span>
<span class="rev-kpi__meta">Discovery · BFF · IAM · React</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Arquitectura adecuada</span>
<span class="rev-kpi__value">Picos · territorio · seguridad</span>
<span class="rev-kpi__meta">PostGIS · JWT · Circuit Breaker</span>
</div>

<div class="rev-kpi">
<span class="rev-kpi__label">Valor municipal</span>
<span class="rev-kpi__value">Conectividad que salva vidas</span>
<span class="rev-kpi__meta">Despacho + terreno + comunidad</span>
</div>

</div>

<div class="rev-panel" markdown="1">

| Criterio | Decisión REV |
|----------|--------------|
| Picos de crisis | MS escalables por dominio |
| Datos sensibles | Gateway perimetral + JWT |
| Fallos parciales | degraded + DegradedAlert |

</div>

</div>

<!--
Notas del expositor:
Cierre argumentativo sólido — citar principios SOLID visibles: DIP (WeatherDataPort), OCP (State handlers), SRP (capas MS).
Pregunta: «¿Reescribirían algo?» → Seguridad en MS con @PreAuthorize como defensa en profundidad; observabilidad ELK/Prometheus.
-->

---

<!-- _class: diagram dense -->

# Evolución futura

## Proyecciones documentadas (informe cap. 14.4)

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div class="rev-panel" markdown="1">

| Prioridad | Evolución |
|-----------|-----------|
| **Alta** | UI transiciones de estado |
| **Alta** | Mapa PostGIS avanzado |
| **Media** | CRUD zonas/recursos Admin |
| **Baja** | IoT climático real |

</div>


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-16.svg" alt="Diagrama REV 16" /></div>


</div>

<div class="rev-callout">Cada MS puede replicarse detrás de Eureka sin reescribir el frontend.</div>

<!--
Notas del expositor:
No prometer features no documentadas. IoT y móvil están en proyección «baja» — visión, no compromiso de entrega.
Pregunta: «¿Microservicios no son overkill?» → Para EVA2 y demo municipal es pedagógico; producción justifica si cargas son heterogéneas — aquí sí (incidentes vs geo vs logística).
-->

---

<!-- _class: lead closing -->

# Conectividad que salva vidas

## Resumen ejecutivo final

<div markdown="1" class="slide-workspace">

<p><strong>REV</strong> entrega una plataforma de emergencias municipal basada en microservicios Spring Cloud, React, Keycloak y Resilience4j.</p>

<div class="rev-panel" markdown="1">

| Entregable EVA2 | Artefacto |
|-----------------|-----------|
| Informe técnico integral | `informe-tecnico-integral-rev.html` |
| Frontend NPM | `frontend/rev-dashboard/` |
| BFF + 3 microservicios | `bff-rev` + 3 MS |
| Evidencias fig. 1–20 | `docs/informe-evidencias/` |
| Git + CI | `main` / `dev` · GitHub Actions |

</div>

### ¿Preguntas?

<p class="rev-caption">Red de Emergencia Valle · Duoc UC · DSY1106 · EVA2 · Mayo 2026</p>

</div>

<!--
Notas del expositor:
Agradecer. Tener listo: Eureka :8761, dashboard :5173, IDE con IncidentStateFactory abierto, docker compose ps.
Preguntas difíciles anticipadas: (1) gap UI/backend — honestidad + roadmap §10.3; (2) seguridad solo en Gateway — perimetro + mejora futura; (3) FakeWeather — adapter pattern deliberado.
Duración objetivo total: 15 min defensa EVA2 ≈ 40 s por slide si se condensa; slides densos permiten seleccionar profundidad por pregunta del docente.
-->
