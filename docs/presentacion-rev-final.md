---
marp: true
title: REV — Red de Emergencia Valle
description: Modernización de la gestión de emergencias — Municipalidad de Valle del Sol
author: Nicolás Barra, Giannina Guerrero
theme: rev-dark
paginate: true
size: 16:9
footer: '<span class="rev-footer__label">SECCIÓN:</span> 306 - V <span class="rev-footer__sep">|</span> <span class="rev-footer__label">INTEGRANTES:</span> NICOLÁS BARRA - GIANNINA GUERRERO'
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
  @import url('presentacion-rev-icons.css');
  pre[is='marp-pre'], pre[data-auto-scaling], code.language-mermaid {
    background: #07111f !important;
    color: #a7b4c7 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
  }
---

<!-- _class: cover-official -->
<!-- _paginate: false -->
<!-- _footer: "" -->

![bg cover](presentacion-assets/portada-rev.png)

<!--
Notas del expositor:
Abrir con el lema institucional. REV no es solo un proyecto académico: responde a un problema real de gestión de emergencias en Valle del Sol. Mencionar que todo lo que verán está verificado en el repositorio rev-fullstack.
Posible pregunta: «¿Por qué microservicios y no un monolito?» → Picos de demanda en crisis, despliegue independiente por dominio, resiliencia perimetral.
-->

---

<!-- _class: dense -->

# Plataforma REV — valor operacional

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 4.5h12M2 8h12M2 11.5h8"/><circle cx="13" cy="11.5" r="1.5"/></svg><span>Capacidades desplegadas para la municipalidad</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph"><svg viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="5.5" y="9" width="5" height="5" rx="1"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Despacho unificado</span><span class="rev-kpi__value">Un panel · tres dominios</span><span class="rev-kpi__meta">Incidentes · Zonas · Recursos</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted"><svg viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Perímetro seguro</span><span class="rev-kpi__value">Gateway + Keycloak</span><span class="rev-kpi__meta">JWT · roles · canal público acotado</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent"><svg viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Resiliencia</span><span class="rev-kpi__value">Circuit Breaker + cache</span><span class="rev-kpi__meta">Operación parcial ante fallos</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph"><svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="2.5"/><path d="M3 14c0-3 2.2-5 5-5s5 2 5 5"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Canal ciudadano</span><span class="rev-kpi__value">Portal sin registro</span><span class="rev-kpi__meta">Reporte georreferenciado 24/7</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted"><svg viewBox="0 0 16 16"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 4 4.5 8.5 4.5 8.5S12.5 10 12.5 6c0-2.5-2-4.5-4.5-4.5Z"/><circle cx="8" cy="6" r="1.5"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Territorio inteligente</span><span class="rev-kpi__value">PostGIS + mapa Leaflet</span><span class="rev-kpi__meta">Riesgo por coordenadas</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Despliegue reproducible</span><span class="rev-kpi__value">12 servicios Docker</span><span class="rev-kpi__meta">Java 21 · React · Eureka</span></div>
</div>

</div>

<div class="rev-callout">

**Propuesta de valor:** REV conecta sala de despacho, terreno y comunidad en una arquitectura **cloud-native** que escala por dominio y mantiene continuidad operacional durante picos de crisis.

</div>

</div>

---

<!-- _class: dense -->

# Problema identificado

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/><path d="M8 5v3M8 11h.01"/></svg><span>Contexto municipal y brecha arquitectónica</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-problem-grid">

<div markdown="1" class="rev-stack">

<p>Valle del Sol requiere coordinar <strong>incendios, incidentes urbanos y alertas ciudadanas</strong> con picos impredecibles. Los sistemas monolíticos colapsan cuando la demanda heterogénea crece en minutos.</p>

<div class="rev-panel" markdown="1">

| Limitación | Impacto operacional |
|------------|---------------------|
| Acoplamiento monolítico | Un fallo detiene todo el despacho |
| Escalado uniforme | No prioriza incidentes críticos |
| Interfaces fragmentadas | Latencia en decisiones del operador |
| Canales ciudadanos lentos | Retraso en activación de brigadas |

</div>

<div class="rev-mini-deck">

<div class="rev-mini"><strong>Escenario</strong><span>Incendio forestal + reportes costeros simultáneos</span></div>
<div class="rev-mini"><strong>Ventana crítica</strong><span>Primeros 15 min definen alcance y víctimas</span></div>
<div class="rev-mini"><strong>REV responde</strong><span>Escalado independiente por dominio de negocio</span></div>

</div>

</div>

<div class="rev-problem-aside">

```mermaid
flowchart TB
  subgraph MONO["Monolito tradicional"]
    M1[UI + lógica + datos]
  end
  subgraph REV["REV — microservicios"]
    R1[Incidentes]
    R2[Zonas]
    R3[Recursos]
    R4[BFF + Gateway]
    R1 & R2 & R3 --> R4
  end
  MONO -.->|picos de crisis| X[Cuellos de botella]
  REV --> OK[Escalado por dominio]
```

<div class="rev-callout">No es «falta de software»: es <strong>arquitectura rígida</strong> frente a urgencia territorial. REV separa responsabilidades para absorber crisis sin tumbar el despacho.</div>

</div>

</div>

</div>

<!--
Notas del expositor:
Conectar con el informe-sistema-rev.md §1: modelos monolíticos no absorben picos. Ejemplo concreto: durante un incendio forestal en zona metropolitana + reportes costeros simultáneos.
Pregunta probable: «¿Qué pasa si cae un servicio?» → Anticipar slide 16 (Circuit Breaker + degraded).
-->

---

<!-- _class: dense -->

# Objetivos del proyecto

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 12 6 4l4 5 4-7"/><path d="M2 14h12"/></svg><span>Objetivos de negocio alineados a la arquitectura</span></h2>

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

Cada objetivo materializa un **bounded context** autónomo: base de datos propia, equipo evolutivo independiente y escalado selectivo. El BFF orquesta la vista; los microservicios ejecutan las reglas de negocio.

</div>

</div>

<!--
Notas del expositor:
Enfatizar trazabilidad objetivo → microservicio. EVA2 exige BFF + 2 MS + arquetipos: REV entrega BFF + 3 MS + arquetipo Maven custom.
Pregunta: «¿Dónde está la transición de estados en UI?» → Backend completo (PUT transicion); UI aún solo visualiza — gap documentado en informe §6.
-->

---

# Visión general de REV

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><circle cx="5.5" cy="5" r="2"/><circle cx="10.5" cy="5" r="2"/><path d="M1.5 13c0-2.2 1.8-4 4-4s4 1.8 4 4M8.5 13c0-1.6 1-3 2.5-3.5"/></svg><span>Actores, dominios y flujo de valor</span></h2>

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

<div class="rev-callout">Tres dominios <strong>sin BD compartida</strong>. El BFF compone <code>DashboardResponse</code> en una sola llamada: incidente + riesgo territorial + recursos asignados + estado <code>degraded</code>.</div>

</div>

```mermaid
flowchart LR
    INC[ms-incidentes<br/>:8081]
    ZON[ms-zonas-riesgo<br/>:8082]
    REC[ms-recursos<br/>:8083]
    BFF[bff-rev]
    UI[Dashboard React]
    INC --> BFF
    ZON --> BFF
    REC --> BFF
    BFF --> UI
```

</div>

<!--
Notas del expositor:
Explicar interacción: al listar incidentes, el BFF enriquece cada uno con nivel de riesgo (coordenadas → ms-zonas) y recursos asignados (ms-recursos).
Pregunta: «¿Por qué separar recursos de incidentes?» → Diferente ritmo de cambio, equipos distintos, escalado independiente (DDD).
-->

---

<!-- _class: diagram-top diagram-focus -->

# Arquitectura general

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="5.5" y="9" width="5" height="5" rx="1"/><path d="M4.5 7v1.5M11.5 7v1.5M8 7v2"/></svg><span>Capas del ecosistema cloud-native</span></h2>

```mermaid
flowchart TB
    FE[React Dashboard :5173]
    GW[API Gateway :8080]
    KCA[Keycloak Adapter :8088]
    KC[Keycloak :8090]
    EU[Eureka :8761]
    SBA[Spring Boot Admin :8099]
    BFF[bff-rev :8085]
    MI[ms-incidentes :8081]
    MZ[ms-zonas-riesgo :8082]
    MR[ms-recursos :8083]
    PG1[(PostgreSQL rev_incidentes)]
    PG2[(PostGIS rev_zonas)]
    PG3[(PostgreSQL rev_recursos)]

    FE -->|/api /auth| GW
    GW -->|JWT| BFF
    GW -->|/auth/**| KCA
    KCA --> KC
    BFF --> MI & MZ & MR
    MI --> PG1
    MZ --> PG2
    MR --> PG3
    MI & MZ & MR & BFF & GW & KCA -.-> EU
```

<div markdown="1" class="slide-workspace slide-workspace--compact">

<div class="rev-chips">
<span class="rev-chip"><strong>Perímetro</strong> Gateway + JWT</span>
<span class="rev-chip"><strong>Datos</strong> 3 BD aisladas</span>
<span class="rev-chip"><strong>Discovery</strong> Eureka lb://</span>
<span class="rev-chip"><strong>Monitor</strong> SBA :8099</span>
</div>

<div class="rev-callout rev-callout--compact">Flujo: <strong>cliente → Gateway → BFF → dominios → datos</strong> · entrada única para operadores y ciudadanos.</div>

</div>

<!--
Notas del expositor:
Recorrer capas: cliente → perímetro → orquestación → dominio → datos. Puerto único de entrada para el frontend: 8080 (Gateway). Vite proxy en dev.
Pregunta: «¿Por qué Keycloak Adapter y no JWT directo en Gateway?» → Separación de responsabilidades; adapter valida RSA256 con JWK del realm rev.
-->

---

<!-- _class: dense -->

# Microservicios implementados

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"/></svg><span>Tres microservicios · tres bases de datos</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Microservicio | Puerto | BD | Responsabilidad |
|---------------|--------|-----|-----------------|
| **ms-incidentes** | 8081 | `rev_incidentes` | Ciclo de vida del incidente |
| **ms-zonas-riesgo** | 8082 | `rev_zonas` | Territorio y evaluación de riesgo |
| **ms-recursos** | 8083 | `rev_recursos` | Logística operacional |

</div>

<div class="rev-ms-deck">

<div class="rev-ms-card rev-ms-card--incidentes">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"><svg viewBox="0 0 16 16"><path d="M8 2 3 13h10z"/><path d="M8 6v3M8 11h.01"/></svg></div>
<div><p class="rev-ms-card__title">ms-incidentes</p><span class="rev-ms-card__meta">:8081 · rev_incidentes</span></div>
</div>
<p>Factory + State en ciclo de vida. Cambios de estado no impactan zonas ni recursos.</p>
</div>

<div class="rev-ms-card rev-ms-card--zonas">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"><svg viewBox="0 0 16 16"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 4 4.5 8.5 4.5 8.5S12.5 10 12.5 6c0-2.5-2-4.5-4.5-4.5Z"/><circle cx="8" cy="6" r="1.5"/></svg></div>
<div><p class="rev-ms-card__title">ms-zonas-riesgo</p><span class="rev-ms-card__meta">:8082 · PostGIS</span></div>
</div>
<p>Evaluación territorial y clima vía <code>WeatherDataPort</code>. Evolución geo sin tocar incidentes.</p>
</div>

<div class="rev-ms-card rev-ms-card--recursos">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"><svg viewBox="0 0 16 16"><rect x="1.5" y="5" width="9" height="6" rx="1"/><path d="M10.5 7H13l1.5 3v1h-4"/><circle cx="4" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/></svg></div>
<div><p class="rev-ms-card__title">ms-recursos</p><span class="rev-ms-card__meta">:8083 · rev_recursos</span></div>
</div>
<p>Brigadas y vehículos con <code>incidente_id</code> UUID — sin FK cross-service entre BD.</p>
</div>

</div>

<div class="rev-callout rev-callout--compact">Separación deliberada: reglas de <strong>incidentes</strong> evolucionan sin redesplegar zonas ni logística. Contrato REST vía Eureka.</div>

</div>

<!--
Notas del expositor:
Cada MS tiene Flyway, Actuator, springdoc-openapi, Eureka client. ddl-auto=validate en los tres.
Pregunta: «¿Cómo se comunican?» → REST síncrono vía WebClient en BFF con nombres Eureka MS-INCIDENTES, etc.
-->

---

<!-- _class: dense -->

# Infraestructura de plataforma

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/><path d="M5 3V2M11 3V2"/></svg><span>Infraestructura transversal y despliegue</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--40-60">

<div class="rev-ms-deck rev-ms-deck--compact">

<div class="rev-ms-card rev-ms-card--incidentes">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg></div>
<div><p class="rev-ms-card__title">Docker Compose</p><span class="rev-ms-card__meta">12 servicios</span></div>
</div>
<p>Stack reproducible: BD, IAM, discovery y apps Java en un solo comando.</p>
</div>

<div class="rev-ms-card rev-ms-card--zonas">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2"/></svg></div>
<div><p class="rev-ms-card__title">Eureka :8761</p><span class="rev-ms-card__meta">Discovery</span></div>
</div>
<p>Registro dinámico de microservicios y balanceo <code>lb://</code> desde el BFF.</p>
</div>

<div class="rev-ms-card rev-ms-card--recursos">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"><svg viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/></svg></div>
<div><p class="rev-ms-card__title">Keycloak + SBA</p><span class="rev-ms-card__meta">:8090 · :8099</span></div>
</div>
<p>IAM realm <code>rev</code> y monitoreo centralizado de salud vía Actuator.</p>
</div>

</div>

<div markdown="1" class="rev-stack">

```mermaid
flowchart TB
    DC[docker compose up] --> DB[(3× PostgreSQL/PostGIS)]
    DC --> KC[Keycloak realm rev]
    DC --> EU[Eureka :8761]
    DC --> APP[6 apps Java 21]
    EU --> SBA[Spring Boot Admin]
    APP --> EU
```

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

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 4h12v8H2z"/><path d="M5 7h6M5 10h3"/></svg><span>Patrones arquitectónicos aplicados en producción</span></h2>

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

<!-- _class: diagram-top diagram-focus dense -->

# Patrones de diseño implementados

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M4 3h8v3H4z"/><path d="M3 9h10v4H3z"/><path d="M6 6v3"/></svg><span>Patrones de diseño con impacto en el negocio</span></h2>

```mermaid
stateDiagram-v2
    [*] --> REPORTADO
    REPORTADO --> EN_PROGRESO: requireGeo
    EN_PROGRESO --> CONTROLADO
    EN_PROGRESO --> ESCALADO
    CONTROLADO --> [*]
    ESCALADO --> EN_PROGRESO
    note right of REPORTADO: Factory + State
    note right of EN_PROGRESO: IncidentStateFactory
```

<div markdown="1" class="slide-workspace">

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

<!--
Notas del expositor:
Mostrar en IDE IncidentStateFactory si hay proyector. Enfatizar doble patrón Factory+State en ms-incidentes.
Pregunta: «¿FakeWeatherAdapter es un hack?» → No; es adaptador consciente para demo; puerto permite IoT futuro (documentado §10.3 informe).
-->

---

<!-- _class: diagram-top diagram-focus -->

# Arquetipos utilizados

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 2h7l3 3v9H3z"/><path d="M10 2v3h3"/></svg><span>Arquetipo para escalar el ecosistema municipal</span></h2>

```mermaid
flowchart TB
    subgraph CAPAS["Capas MS de negocio"]
        C[Controller]
        S[Service]
        R[Repository]
        E[Entity / DTO]
        C --> S --> R --> E
    end
    subgraph HEX["Hexagonal — ms-zonas-riesgo"]
        P[WeatherDataPort]
        A[FakeWeatherAdapter]
        P --> A
    end
    subgraph ARC["Arquetipo Maven"]
        M[rev-microservice-archetype]
    end
    M -.-> CAPAS
```

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Capa | Ejemplo |
|------|---------|
| Controller | `IncidenteController` |
| Service | `IncidenteService` |
| Repository | `IncidenteRepository` |

</div>

<div class="rev-callout">Estandariza nuevos MS municipales sin reconfigurar Eureka, Actuator ni Flyway.</div>

</div>

<!--
Notas del expositor:
Los 3 MS actuales fueron implementados manualmente pero replican el arquetipo. Comando mvn archetype:generate documentado en patrones-y-arquitectura-rev.md §3.2.
Pregunta EVA2: «¿Cuántos arquetipos Maven?» → Uno custom en archetypes/; estructura de capas como arquetipo organizacional.
-->

---

<!-- _class: diagram-top diagram-focus dense -->

# DDD y Bounded Contexts

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><path d="M6 5.5 7 10M10 5.5 9 10"/></svg><span>Bounded contexts y capa anti-corrupción</span></h2>

```mermaid
flowchart TB
    subgraph BC1["BC Incidentes"]
        MI[ms-incidentes]
    end
    subgraph BC2["BC Zonas"]
        MZ[ms-zonas-riesgo]
    end
    subgraph BC3["BC Recursos"]
        MR[ms-recursos]
    end
    subgraph ACL["Anti-Corruption Layer"]
        BFF[bff-rev]
    end
    MI & MZ & MR -->|REST| BFF
    BFF -->|DashboardResponse| FE[React SPA]
```

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Ventaja | Ejemplo REV |
|---------|-------------|
| Lenguaje ubicuo | «Estado» vs «Nivel» |
| Evolución independiente | CRUD zonas sin migrar incidentes |
| Fallas contenidas | Circuit Breaker por MS |

</div>

<div class="rev-callout">Contrato UI: <code>{ incidente, zonaRiesgo, recursos, degraded }</code></div>

</div>

<!--
Notas del expositor:
Asignacion.incidente_id es UUID sin FK cross-DB — integración eventual, típica en microservicios.
Pregunta: «¿Es DDD completo?» → Bounded contexts sí; agregados simplificados; mejora futura: carpeta domain/ explícita (patrones doc §10).
-->

---

<!-- _class: visual -->

# Frontend y experiencia de usuario

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="9" rx="1"/><path d="M2 6h12"/></svg><span>Consola operacional para sala de despacho</span></h2>

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

<div class="rev-shot__cap">Panel Despacho — KPIs, alertas y tabla de incidentes activos</div>

</div>

</div>

<!--
Notas del expositor:
Demo en vivo recomendada: Inicio → Despacho → Incidentes con filtro alto riesgo → Zonas mapa → Portal reporte.
Pregunta: «¿Brigadista puede crear incidentes?» → No; canManageIncidents solo Admin/Despachador (useAuth.ts).
-->

---

<!-- _class: dense slide-diag-media slide-media-portal -->

# Reporte público y canal ciudadano

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 8h3M11 8h3"/><path d="M5 6l3 2-3 2M11 6l-3 2 3 2"/></svg><span><span class="rev-flow">Portal <span class="rev-flow__arrow">→</span> Gateway <span class="rev-flow__arrow">→</span> ms-incidentes</span></span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--diag-priority">

<div markdown="1" class="rev-stack">

```mermaid
flowchart LR
    C[Ciudadano] --> P[Portal]
    P --> GW[Gateway]
    GW --> MI[ms-incidentes]
    MI --> R[REPORTADO]
    D[Despachador] --> INT[Panel]
    INT --> R
```

<div class="rev-chips">
<span class="rev-chip"><strong>Login</strong> /login · POST público</span>
<span class="rev-chip"><strong>Portal</strong> /portal · sin registro</span>
<span class="rev-chip"><strong>Despacho</strong> /api/** · JWT</span>
</div>

</div>

<div class="rev-media-panel rev-media-panel--fill">
<img src="images/rev-slide-portal.png" alt="Canal ciudadano REV" />
<span class="rev-media-panel__cap">Canal vecinal — reporte sin fricción</span>
</div>

<div class="rev-callout rev-callout--compact rev-callout--full">El ciudadano activa la cadena en segundos: georreferencia → <code>REPORTADO</code> → visibilidad inmediata en despacho.</div>

</div>

---

<!-- _class: visual -->

# Capturas operativas del sistema

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><rect x="2" y="3" width="5" height="4" rx=".5"/><rect x="9" y="3" width="5" height="4" rx=".5"/><rect x="5.5" y="9" width="5" height="4" rx=".5"/></svg><span>Módulos críticos en operación real</span></h2>

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

<p class="rev-caption">Capturas del stack Docker local con datos reales de despacho</p>

---

# Diseño UX/UI y Design System

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5"/><path d="M8 3v10M3 8h10"/></svg><span>Design system para entornos de misión crítica</span></h2>

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

<!-- _class: dense -->

# Roles y permisos

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/></svg><span>Control de acceso por rol operativo</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--55-45">

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

<div markdown="1" class="rev-diagram-col">

```mermaid
flowchart LR
    U[Usuario] --> KC[Keycloak realm rev]
    KC --> D[Despachador]
    KC --> B[Brigadista]
    KC --> A[Admin]
    D & A --> W[Escritura API]
    B --> R[Solo lectura]
```

<div class="rev-callout rev-callout--compact"><code>useAuth.ts</code> · usuarios dev: despachador / brigadista / admin</div>

</div>

</div>

<!--
Notas del expositor:
Seguridad real en Gateway: AuthenticationFilter valida JWT y roles Despachador/Admin/Brigadista. UI oculta botones; Gateway bloquea API.
Pregunta: «¿Por qué Brigadista accede al panel?» → Visibilidad de incidentes activos y recursos; diferencia está en escritura.
-->

---

<!-- _class: diagram-top diagram-focus dense -->

# Seguridad

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><rect x="4" y="7" width="8" height="6" rx="1"/><path d="M5.5 7V5a3.5 3.5 0 0 1 5 0v2"/></svg><span>Perímetro de seguridad y autenticación</span></h2>

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as React
    participant GW as Gateway
    participant AUTH as Adapter
    participant KC as Keycloak
    participant BFF as bff-rev
    U->>FE: Login
    FE->>GW: POST /auth/login
    GW->>KC: OAuth2
    KC-->>FE: JWT
    FE->>GW: /api/** + Bearer
    GW->>AUTH: Validar RSA256
    GW->>BFF: Autorizado
```

<div markdown="1" class="slide-workspace slide-workspace--compact">

<div class="rev-chips">
<span class="rev-chip"><strong>IAM</strong> Keycloak rev</span>
<span class="rev-chip"><strong>Token</strong> JWT RSA256</span>
<span class="rev-chip"><strong>Perímetro</strong> AuthenticationFilter</span>
<span class="rev-chip"><strong>Público</strong> /api/public/**</span>
</div>

<div class="rev-callout rev-callout--compact">Control centralizado en Gateway + adapter — perímetro antes del BFF y microservicios.</div>

</div>

<!--
Notas del expositor:
Explicar por qué adapter separado: Gateway no implementa lógica OAuth; adapter concentra login, roles, refresh (refresh aún no en UI).
Pregunta: «¿Es seguro el portal público?» → Solo creación de incidente; misma validación de negocio; sin acceso a datos agregados del despacho.
-->

---

<!-- _class: diagram-top diagram-focus -->

# Continuidad operacional y resiliencia

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M13 3 3 13M3 3l10 10"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2"/></svg><span>Continuidad operacional ante fallos parciales</span></h2>

```mermaid
flowchart TD
    BFF[DashboardFacadeService]
    ZR[ms-zonas-riesgo]
    RC[ms-recursos]
    CACHE[ZonaRiesgoCache]
    UI[React Dashboard]
    BFF -->|CircuitBreaker| ZR
    BFF -->|CircuitBreaker| RC
    ZR -.->|fallo| FB1[fallback + cache]
    RC -.->|fallo| FB2[degraded: true]
    FB1 --> UI
    FB2 --> UI
```

<div markdown="1" class="slide-workspace slide-workspace--compact">

<div class="rev-chips">
<span class="rev-chip"><strong>Ventana</strong> 10 req</span>
<span class="rev-chip"><strong>Umbral</strong> 50% fallos</span>
<span class="rev-chip"><strong>Cooldown</strong> 5s open</span>
<span class="rev-chip"><strong>UX</strong> Información parcial</span>
</div>

<div class="rev-callout rev-callout--compact">El despachador mantiene visibilidad de incidentes aunque zonas o recursos fallen temporalmente.</div>

</div>

<!--
Notas del expositor:
Demo opcional: detener ms-recursos y refrescar dashboard — KPI «Con avisos» sube, DegradedAlert visible.
Pregunta: «¿Por qué no Hystrix?» → Resilience4j 2.2.0 en parent POM; estándar actual Spring Boot 4.
-->

---

<!-- _class: dense slide-diag-media slide-media-persist -->

# Persistencia y base de datos

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="5" ry="2"/><path d="M3 4.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4M3 8.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4"/></svg><span>Persistencia aislada y migraciones versionadas</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--diag-priority">

<div markdown="1" class="rev-stack">

```mermaid
erDiagram
    INCIDENTES ||--o{ TRANSICIONES : audita
    ZONAS ||--o{ CLIMA : condiciones
    BRIGADAS ||--o{ ASIGNACIONES : participa
    INCIDENTES ||--o{ ASIGNACIONES : UUID_ref
```

<div class="rev-panel" markdown="1">

| MS | Base de datos | Motor |
|----|---------------|-------|
| ms-incidentes | `rev_incidentes` | PostgreSQL 16 |
| ms-zonas-riesgo | `rev_zonas` | PostGIS 16 |
| ms-recursos | `rev_recursos` | PostgreSQL 16 |

</div>

<div class="rev-callout rev-callout--compact"><code>ddl-auto=validate</code> + Flyway · integridad por servicio, sin FK entre BD.</div>

</div>

<div class="rev-media-panel rev-media-panel--fill">
<img src="images/rev-slide-persist.png" alt="Persistencia aislada REV" />
<span class="rev-media-panel__cap">Datos aislados — integridad por microservicio</span>
</div>

</div>

---

<!-- _class: dense slide-diag-media -->

# Observabilidad y trazabilidad

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 12 5 7l3 3 3-5 3 7"/><path d="M2 14h12"/></svg><span>Observabilidad operativa y evolución</span></h2>

<div markdown="1" class="slide-workspace">

<div markdown="1" class="rev-stack">

```mermaid
flowchart TB
    APP[Apps Java] --> ACT[Actuator health/info]
    APP --> EU[Eureka]
    EU --> SBA[Spring Boot Admin]
    GW[Gateway] --> LOG[Slf4j filtros]
    MI[ms-incidentes] --> AUD[transiciones_estado]
    FUT[Roadmap] --> PROM[Prometheus]
    FUT --> ELK[ELK / OTel]
```

<div class="rev-chips">
<span class="rev-chip"><strong>Actuator</strong> implementado</span>
<span class="rev-chip"><strong>SBA</strong> :8099</span>
<span class="rev-chip"><strong>Roadmap</strong> Prometheus · ELK</span>
</div>

<div class="rev-callout rev-callout--compact"><code>degraded: true</code> conecta resiliencia backend con UX operacional.</div>

</div>

</div>

---

<!-- _class: dense slide-diag-media slide-media-git -->

# Estrategia Git y trabajo colaborativo

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><circle cx="4" cy="4" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="8" r="1.5"/><path d="M4 5.5v5M5.5 4h4a2 2 0 0 1 2 2v0"/></svg><span>Colaboración, versiones y calidad continua</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--diag-priority">

<div markdown="1" class="rev-stack">

```mermaid
gitGraph
    commit id: "init"
    branch dev
    checkout dev
    commit id: "integración"
    branch feature/portal
    commit id: "FEAT portal"
    checkout dev
    merge feature/portal
    checkout main
    merge dev id: "release REV"
```

<div class="rev-chips">
<span class="rev-chip"><strong>main</strong> release municipal</span>
<span class="rev-chip"><strong>dev</strong> integración diaria</span>
<span class="rev-chip"><strong>feature/*</strong> PR → dev</span>
</div>

<div class="rev-callout rev-callout--compact">Commits atómicos <code>[ TIPO ]:</code> · CI en GitHub Actions</div>

</div>

<div class="rev-media-panel rev-media-panel--fill">
<img src="images/rev-slide-git.png" alt="Colaboración Git REV" />
<span class="rev-media-panel__cap">Trabajo colaborativo — versiones y CI</span>
</div>

</div>

---

<!-- _class: dense -->

# Trazabilidad técnica

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M6 7h4M6 10h6"/><path d="M6 3v2"/></svg><span>De la arquitectura al código desplegado</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph"><svg viewBox="0 0 16 16"><path d="M2 4h12v8H2z"/><path d="M5 7h6M5 10h3"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Patrones</span><span class="rev-kpi__value">Factory · Adapter · Facade</span><span class="rev-kpi__meta">Clases verificables en repo</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted"><svg viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Seguridad</span><span class="rev-kpi__value">JWT + Gateway Filter</span><span class="rev-kpi__meta">Keycloak realm rev</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent"><svg viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="5" ry="2"/><path d="M3 4.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Datos</span><span class="rev-kpi__value">Flyway + PostGIS</span><span class="rev-kpi__meta">3 esquemas aislados</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="9" rx="1"/><path d="M5 13h6"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">UX operacional</span><span class="rev-kpi__value">Dashboard + Portal</span><span class="rev-kpi__meta">Experiencia municipal</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Infra</span><span class="rev-kpi__value">Docker Compose</span><span class="rev-kpi__meta">12 servicios reproducibles</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent"><svg viewBox="0 0 16 16"><path d="M4 8.5 6.5 11 12 5"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Calidad</span><span class="rev-kpi__value">Tests + CI</span><span class="rev-kpi__meta">Factory · BFF · Zonas</span></div>
</div>

</div>

<div class="rev-callout">Cada decisión arquitectónica tiene **evidencia ejecutable**: código fuente, despliegue local y comportamiento observable en el dashboard municipal.</div>

</div>

---

<!-- _class: dense tech-refined -->

# Tecnologías utilizadas

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 5h12v7H2z"/><path d="M5 5V3h6v2"/></svg><span>Stack tecnológico y criterio de selección</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--55-45-media">

<div markdown="1" class="rev-stack">

<div class="rev-tech-deck">

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="9" rx="1"/><path d="M5 13h6"/></svg></div><span class="rev-tech-card__layer">Frontend</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">React 18 + Vite 5 + TS</span><span class="rev-tech-card__meta">Bootstrap 5 · Leaflet</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"><svg viewBox="0 0 16 16"><path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"/></svg></div><span class="rev-tech-card__layer">Backend</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Java 21 · Spring Boot 4</span><span class="rev-tech-card__meta">Spring Cloud 2025.1</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"><svg viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="5" ry="2"/><path d="M3 4.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4"/></svg></div><span class="rev-tech-card__layer">Datos</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">PostgreSQL 16 + PostGIS</span><span class="rev-tech-card__meta">3 bases aisladas · Flyway</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"><svg viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg></div><span class="rev-tech-card__layer">Resiliencia</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Resilience4j 2.2.0</span><span class="rev-tech-card__meta">Circuit Breaker en BFF</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"><svg viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/></svg></div><span class="rev-tech-card__layer">Seguridad</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Keycloak 24</span><span class="rev-tech-card__meta">realm rev · JWT Gateway</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg></div><span class="rev-tech-card__layer">Infra</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Docker Compose</span><span class="rev-tech-card__meta">SBA :8099 · Eureka</span></div>
</div>

</div>

<div class="rev-callout rev-callout--compact">Criterio: **madurez enterprise**, ecosistema abierto y despliegue containerizado reproducible.</div>

</div>

<div class="rev-media-panel rev-media-panel--center">
<img src="images/rev-about-map.png" alt="Territorio y mapa REV" />
<span class="rev-media-panel__cap">Territorio inteligente — visión geo institucional</span>
</div>

</div>

<!--
Notas del expositor:
Monorepo Maven rev-parent centraliza versiones Spring Cloud 2025.1.1. Frontend empaquetado NPM en frontend/rev-dashboard/.
Pregunta: «¿Por qué WebClient y no Feign?» → BFF usa WebClient reactivo con @LoadBalanced — documentado en client services.
-->

---

<!-- _class: diagram-top diagram-focus dense -->

# Flujo funcional del sistema

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 8h2l2-4 2 8 2-5 2 3h2"/></svg><span>Flujo operativo de punta a punta</span></h2>

```mermaid
sequenceDiagram
    actor Op as Despachador
    participant FE as React
    participant GW as Gateway
    participant BFF as bff-rev
    participant MI as ms-incidentes
    participant MZ as ms-zonas
    participant MR as ms-recursos
    Op->>FE: 1 Login
    Op->>FE: 2 Dashboard
    FE->>GW: GET /api/dashboard
    GW->>BFF: Forward
    BFF->>MI: Listar
    BFF->>MZ: Riesgo
    BFF->>MR: Recursos
    Op->>FE: 3 Crear / 5 Asignar
    BFF->>MR: Asignación
```

<div markdown="1" class="slide-workspace slide-workspace--compact">

<div class="rev-chips">
<span class="rev-chip"><strong>1</strong> LoginPage</span>
<span class="rev-chip"><strong>2</strong> DashboardPage</span>
<span class="rev-chip"><strong>3</strong> Modal incidentes</span>
<span class="rev-chip"><strong>4</strong> ZonasPage</span>
<span class="rev-chip"><strong>5</strong> Asignar recurso</span>
</div>

<div class="rev-callout rev-callout--compact">Ciudadano: <code>PortalPage</code> <span class="rev-flow__arrow">→</span> POST público sin login.</div>

</div>

<!--
Notas del expositor:
Recorrer demo en 2 minutos siguiendo la secuencia. Mencionar incidentCreatedTick en UiContext que refresca listas tras crear.
Pregunta: «¿Transición REPORTADO → EN_PROGRESO desde UI?» → No en UI; existe PUT en backend — gap §6.1 informe.
-->

---

<!-- _class: dense visual resultados-refined -->

# Resultados obtenidos

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6z"/></svg><span>Impacto técnico, operacional y municipal</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--55-45-media">

<div markdown="1" class="rev-stack">

<div class="rev-result-deck">

<div class="rev-result-card">
<div class="rev-result-card__head">Técnicos</div>
<div class="rev-result-card__body" markdown="1">

- Monorepo 3 MS + BFF + Gateway + IAM
- 6+ patrones trazables a clases Java
- Circuit Breaker + cache aside operativos
- Arquetipo Maven y tests BFF

</div>
</div>

<div class="rev-result-card">
<div class="rev-result-card__head">Operacionales</div>
<div class="rev-result-card__body" markdown="1">

- Dashboard unificado multi-fuente
- Portal ciudadano sin fricción
- Mapa de zonas de riesgo en vivo
- Asignación brigada/vehículo desde UI

</div>
</div>

<div class="rev-callout rev-callout--compact"><strong>Beneficio municipal:</strong> coordinación más rápida, menor carga cognitiva y canal vecinal directo.</div>

</div>

</div>

<div class="rev-media-panel rev-media-panel--fill">
<img src="images/rev-imag-06.png" alt="Sala de control REV" />
<span class="rev-media-panel__cap">Coordinación institucional — centro de operaciones</span>
</div>

</div>

<!--
Notas del expositor:
Relacionar cada resultado con objetivos slide 3. Honestidad académica: gap UI vs backend es fortaleza (consciencia madurez), no debilidad oculta.
Pregunta: «¿Qué falta?» → Transiciones estado UI, CRUD zonas, refresh token — todos listados en informe §10.3.
-->

---

<!-- _class: dense conclusion-refined -->

# Conclusiones

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M4 8.5 6.5 11 12 5"/></svg><span>Síntesis ejecutiva para la municipalidad</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--58-42">

<div markdown="1" class="rev-stack">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph"><svg viewBox="0 0 16 16"><path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Solución moderna</span><span class="rev-kpi__value">Microservicios reales</span><span class="rev-kpi__meta">Discovery · BFF · IAM</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted"><svg viewBox="0 0 16 16"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 4 4.5 8.5 4.5 8.5S12.5 10 12.5 6c0-2.5-2-4.5-4.5-4.5Z"/><circle cx="8" cy="6" r="1.5"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Arquitectura adecuada</span><span class="rev-kpi__value">Picos · territorio</span><span class="rev-kpi__meta">PostGIS · JWT · CB</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent"><svg viewBox="0 0 16 16"><path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6z"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Valor municipal</span><span class="rev-kpi__value">Conectividad que salva vidas</span><span class="rev-kpi__meta">Despacho + comunidad</span></div>
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

<div class="rev-media-panel rev-media-panel--contain">
<img src="images/rev-about-dispatch.png" alt="Centro de despacho REV" />
<span class="rev-media-panel__cap">Despacho institucional — misión crítica municipal</span>
</div>

</div>

<!--
Notas del expositor:
Cierre argumentativo sólido — citar principios SOLID visibles: DIP (WeatherDataPort), OCP (State handlers), SRP (capas MS).
Pregunta: «¿Reescribirían algo?» → Seguridad en MS con @PreAuthorize como defensa en profundidad; observabilidad ELK/Prometheus.
-->

---

<!-- _class: dense slide-diag-media slide-media-roadmap -->

# Evolución futura

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 12h12"/><path d="M4 9l3-5 3 3 3-6"/></svg><span>Hoja de ruta y madurez del producto</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--diag-priority">

<div markdown="1" class="rev-stack">

```mermaid
flowchart LR
    REV[REV actual] --> T1[Transiciones UI]
    REV --> T2[Observabilidad]
    REV --> T3[Clima real]
    REV --> T4[Réplicas Eureka]
```

<div class="rev-chips">
<span class="rev-chip"><strong>Alta</strong> transiciones UI · PostGIS</span>
<span class="rev-chip"><strong>Media</strong> CRUD zonas/recursos</span>
<span class="rev-chip"><strong>Baja</strong> IoT climático real</span>
</div>

<div class="rev-callout rev-callout--compact">Escalado horizontal por MS vía Eureka — sin reescribir el frontend municipal.</div>

</div>

<div class="rev-media-panel rev-media-panel--fill">
<img src="images/rev-slide-roadmap.png" alt="Roadmap REV" />
<span class="rev-media-panel__cap">Visión futura — madurez y escalado</span>
</div>

</div>

<!--
Notas del expositor:
No prometer features no documentadas. IoT y móvil están en proyección «baja» — visión, no compromiso de entrega.
Pregunta: «¿Microservicios no son overkill?» → Para EVA2 y demo municipal es pedagógico; producción justifica si cargas son heterogéneas — aquí sí (incidentes vs geo vs logística).
-->

---

<!-- _class: closing-premium -->

<div class="rev-closing-grid">

<div class="rev-closing-copy">

<img src="presentacion-assets/emblem-light.png" alt="Logo REV" class="rev-closing-logo" />

# Conectividad que salva vidas

<p class="rev-closing-tagline">Red de Emergencia Valle</p>

<p class="rev-closing-lead"><strong>REV</strong> integra despacho, territorio y comunidad en una plataforma cloud-native lista para operar: microservicios Spring Cloud, dashboard React, IAM Keycloak y resiliencia Resilience4j.</p>

<div class="rev-closing-kpis">
<div class="rev-kpi"><span class="rev-kpi__label">Despacho</span><span class="rev-kpi__value">Unificado</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Ciudadanía</span><span class="rev-kpi__value">Portal 24/7</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Seguridad</span><span class="rev-kpi__value">JWT + Gateway</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Resiliencia</span><span class="rev-kpi__value">Modo degradado</span></div>
</div>

<div class="rev-closing-cta">
<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="6"/><path d="M6 8h4M8 6v4"/></svg>
¿Preguntas?
</div>

<p class="rev-caption">Municipalidad de Valle del Sol · Modernización de gestión de emergencias</p>

</div>

<div class="rev-closing-hero">
<img src="images/rev-closing-hero.png" alt="REV — despacho, territorio y comunidad" />
</div>

</div>

<!--
Notas del expositor:
Agradecer. Tener listo: Eureka :8761, dashboard :5173, IDE con IncidentStateFactory abierto, docker compose ps.
Preguntas difíciles anticipadas: (1) gap UI/backend — honestidad + roadmap §10.3; (2) seguridad solo en Gateway — perimetro + mejora futura; (3) FakeWeather — adapter pattern deliberado.
Duración objetivo total: 15 min defensa EVA2 ≈ 40 s por slide si se condensa; slides densos permiten seleccionar profundidad por pregunta del docente.
-->
