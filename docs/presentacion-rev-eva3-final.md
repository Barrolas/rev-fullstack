---
marp: true
title: REV — Red de Emergencia Valle · Integración y calidad
description: Plataforma municipal de emergencias — arquitectura de microservicios, integración REST y evidencia de pruebas
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

<!-- _class: dense slide-value-premium -->

# Plataforma REV — valor operacional

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 4.5h12M2 8h12M2 11.5h8"/><circle cx="13" cy="11.5" r="1.5"/></svg><span>Capacidades desplegadas para la municipalidad</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-value-layout">

<aside class="rev-value-aside">

<img src="presentacion-assets/emblem-light.png" alt="Logo REV" class="rev-value-aside__logo" />

<div class="rev-value-aside__pitch">
<span class="rev-value-aside__eyebrow">Propuesta de valor</span>
<p>REV conecta <strong>sala de despacho, terreno y comunidad</strong> en una arquitectura cloud-native que escala por dominio, mantiene continuidad durante picos de crisis y <strong>valida flujos críticos con pruebas automatizadas</strong>.</p>
</div>

<div class="rev-value-aside__chips">
<span class="rev-chip">12 servicios Docker</span>
<span class="rev-chip">JaCoCo ≥ 60 %</span>
<span class="rev-chip">Eureka + Gateway</span>
</div>

</aside>

<div class="rev-value-grid">

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
<div class="rev-kpi__glyph rev-kpi__glyph--accent"><svg viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M6 7l2 2 3-4"/></svg></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Calidad verificada</span><span class="rev-kpi__value">JUnit · H2 · E2E</span><span class="rev-kpi__meta">Suite Maven · cero fallos críticos</span></div>
</div>

</div>

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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-01.png" alt="Diagrama REV 01" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-02.png" alt="Diagrama REV 02" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-03.png" alt="Diagrama REV 03" /></div>


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
<div class="rev-ms-card__icon"></div>
<div><p class="rev-ms-card__title">ms-incidentes</p><span class="rev-ms-card__meta">:8081 · rev_incidentes</span></div>
</div>
<p>Factory + State en ciclo de vida. Cambios de estado no impactan zonas ni recursos.</p>
</div>

<div class="rev-ms-card rev-ms-card--zonas">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"></div>
<div><p class="rev-ms-card__title">ms-zonas-riesgo</p><span class="rev-ms-card__meta">:8082 · PostGIS</span></div>
</div>
<p>Evaluación territorial y clima vía <code>WeatherDataPort</code>. Evolución geo sin tocar incidentes.</p>
</div>

<div class="rev-ms-card rev-ms-card--recursos">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"></div>
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
<div class="rev-ms-card__icon"></div>
<div><p class="rev-ms-card__title">Docker Compose</p><span class="rev-ms-card__meta">12 servicios</span></div>
</div>
<p>Stack reproducible: BD, IAM, discovery y apps Java en un solo comando.</p>
</div>

<div class="rev-ms-card rev-ms-card--zonas">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"></div>
<div><p class="rev-ms-card__title">Eureka :8761</p><span class="rev-ms-card__meta">Discovery</span></div>
</div>
<p>Registro dinámico de microservicios y balanceo <code>lb://</code> desde el BFF.</p>
</div>

<div class="rev-ms-card rev-ms-card--recursos">
<div class="rev-ms-card__head">
<div class="rev-ms-card__icon"></div>
<div><p class="rev-ms-card__title">Keycloak + SBA</p><span class="rev-ms-card__meta">:8090 · :8099</span></div>
</div>
<p>IAM realm <code>rev</code> y monitoreo centralizado de salud vía Actuator.</p>
</div>

</div>

<div markdown="1" class="rev-stack">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-04.png" alt="Diagrama REV 04" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-05.png" alt="Diagrama REV 05" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-06.png" alt="Diagrama REV 06" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-07.png" alt="Diagrama REV 07" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-08.png" alt="Diagrama REV 08" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-09.png" alt="Diagrama REV 09" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-10.png" alt="Diagrama REV 10" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-11.png" alt="Diagrama REV 11" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-12.png" alt="Diagrama REV 12" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-13.png" alt="Diagrama REV 13" /></div>


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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-14.png" alt="Diagrama REV 14" /></div>


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
<div class="rev-kpi__glyph">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Patrones</span><span class="rev-kpi__value">Factory · Adapter · Facade</span><span class="rev-kpi__meta">Clases verificables en repo</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Seguridad</span><span class="rev-kpi__value">JWT + Gateway Filter</span><span class="rev-kpi__meta">Keycloak realm rev</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Datos</span><span class="rev-kpi__value">Flyway + PostGIS</span><span class="rev-kpi__meta">3 esquemas aislados</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">UX operacional</span><span class="rev-kpi__value">Dashboard + Portal</span><span class="rev-kpi__meta">Experiencia municipal</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Infra</span><span class="rev-kpi__value">Docker Compose</span><span class="rev-kpi__meta">12 servicios reproducibles</span></div>
</div>
<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent">></div>
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
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Frontend</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">React 18 + Vite 5 + TS</span><span class="rev-tech-card__meta">Bootstrap 5 · Leaflet</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Backend</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Java 21 · Spring Boot 4</span><span class="rev-tech-card__meta">Spring Cloud 2025.1</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Datos</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">PostgreSQL 16 + PostGIS</span><span class="rev-tech-card__meta">3 bases aisladas · Flyway</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Resiliencia</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Resilience4j 2.2.0</span><span class="rev-tech-card__meta">Circuit Breaker en BFF</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Seguridad</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Keycloak 24</span><span class="rev-tech-card__meta">realm rev · JWT Gateway</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Infra</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">Docker Compose</span><span class="rev-tech-card__meta">SBA :8099 · Eureka</span></div>
</div>

<div class="rev-tech-card">
<div class="rev-tech-card__head"><div class="rev-tech-card__icon"></div><span class="rev-tech-card__layer">Calidad</span></div>
<div class="rev-tech-card__body"><span class="rev-tech-card__name">JUnit 5 · Mockito · JaCoCo</span><span class="rev-tech-card__meta">Maven Surefire · E2E manual</span></div>
</div>

</div>

<div class="rev-callout rev-callout--compact">Criterio: **madurez enterprise**, ecosistema abierto, despliegue reproducible y **suite de pruebas trazable** en flujos de negocio críticos.</div>

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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-15.png" alt="Diagrama REV 15" /></div>


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

<!-- _class: dense -->

# Estrategia de calidad y pruebas

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M6 7l2 2 3-4"/></svg><span>Tres capas de validación en flujos críticos</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Capa | Herramienta | Enfoque |
|------|-------------|---------|
| **Unitarias** | JUnit 5 + Mockito | Reglas de negocio aisladas — Factory, services, validaciones |
| **Integración** | `@SpringBootTest` + H2 | Contexto Spring y orquestación BFF con clientes simulados |
| **End-to-end** | curl + UI navegador | Despacho, portal ciudadano, seguridad JWT, resiliencia |

</div>

<div class="rev-mini-deck">

<div class="rev-mini"><strong>Principio</strong><span>No solo camino feliz — bugs, vulnerabilidades y uso incorrecto</span></div>
<div class="rev-mini"><strong>Alcance</strong><span>ms-incidentes · ms-zonas · ms-recursos · bff-rev · Gateway</span></div>
<div class="rev-mini"><strong>Meta</strong><span>≥ 60 % cobertura JaCoCo en módulos de negocio</span></div>

</div>

<div class="rev-callout">Las pruebas cubren el **ciclo de incidentes**, **correlación geográfica**, **asignación de brigadas**, **seguridad JWT** y **portal ciudadano** — los flujos que no pueden fallar en operación municipal.</div>

</div>

---

<!-- _class: dense -->

# Áreas críticas bajo prueba

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/><path d="M8 5v3M8 11h.01"/></svg><span>Riesgos operacionales que la suite protege</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Área | Riesgo si falla | Componente |
|------|-----------------|------------|
| Transición EN_PROGRESO sin coordenadas | Despacho a ubicación inválida | `IncidentStateFactory` |
| Correlación incorrecta o irreversible | Duplicidad o pérdida de trazabilidad | `CorrelacionService` · BFF Facade |
| Asignación duplicada de brigada | Dos incidentes compitiendo por recurso | `RecursoService` |
| Resolución de zona de riesgo | Clasificación errónea del incidente | `ZonaService` |
| Acceso sin token | Exposición de datos operativos | `AuthenticationFilter` |
| Portal → cola despacho | Reporte ciudadano invisible | Frontend + BFF + ms-incidentes |

</div>

<div class="rev-callout rev-callout--compact">Cada área tiene **casos positivos y negativos** documentados en la matriz de pruebas — trazabilidad ID → clase de test → evidencia de ejecución.</div>

</div>

---

<!-- _class: dense -->

# Matriz de pruebas — flujos críticos

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 3h12v10H2z"/><path d="M5 7h6M5 10h3"/></svg><span>Casos representativos trazados PASS</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| ID | Tipo | Escenario | Patrón |
|----|------|-----------|--------|
| **UT-01** | Unit | Sin lat/lng no avanza a EN_PROGRESO | Factory + State |
| **UT-05** | Unit | Doble asignación brigada → `ASIGNACION_DUPLICADA` | Regla negocio |
| **UT-08** | Unit | Revertir correlación bloqueada con brigadas activas | Facade |
| **IT-04** | Integración | BFF reasigna y luego revierte correlación | Facade multi-MS |
| **E2E-01** | E2E | Login despachador → asignar brigada → activos | Flujo completo |
| **E2E-03** | E2E | GET `/api/incidentes` sin JWT → HTTP 401 | Seguridad Gateway |

</div>

<div class="rev-chips">
<span class="rev-chip"><strong>Unitarias</strong> UT-01…UT-25</span>
<span class="rev-chip"><strong>Integración</strong> IT-01…IT-07</span>
<span class="rev-chip"><strong>E2E</strong> E2E-01…E2E-06</span>
</div>

<div class="rev-callout rev-callout--compact">Matriz completa: **32 casos automatizados PASS** + 6 escenarios E2E documentados con evidencia en video de plataforma.</div>

</div>

---

<!-- _class: dense visual resultados-refined -->

# Resultados de ejecución automatizada

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M6 7l2 2 3-4"/></svg><span>Suite Maven — cero fallos en módulos críticos</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--55-45-media">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Módulo | Tests | Failures | Resultado |
|--------|-------|----------|-----------|
| **ms-incidentes** | 14+ | 0 | PASS |
| **ms-zonas-riesgo** | 10+ | 0 | PASS |
| **ms-recursos** | 6+ | 0 | PASS |
| **bff-rev** | 8+ | 0 | PASS |

</div>

<div class="rev-deck rev-deck--3">

<div class="rev-kpi"><span class="rev-kpi__label">Total trazado</span><span class="rev-kpi__value">32 PASS</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Segunda pasada</span><span class="rev-kpi__value">+18 tests</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Regresiones</span><span class="rev-kpi__value">0</span></div>

</div>

<div class="rev-callout rev-callout--compact">Comando: <code>mvnw.cmd test jacoco:report</code> por módulo · reporte en <code>target/site/jacoco/index.html</code></div>

</div>

<div class="rev-card">

**Evidencia de ejecución**

- Consola Maven: 0 failures · 0 errors
- Segunda pasada v2 (2026-06-29): +18 métodos sin regresiones
- Script: `.\scripts\run-eva3-tests.ps1`

</div>

</div>

---

<!-- _class: dense -->

# Cobertura JaCoCo por módulo

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 12 5 7l3 3 3-5 3 7"/><path d="M2 14h12"/></svg><span>Métricas de instrucciones — segunda pasada v2</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--55-45">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| Módulo | v1 | v2 | Δ | Meta ≥60 % |
|--------|----|----|---|------------|
| **ms-zonas-riesgo** | 57.0 % | **69.7 %** | +12.7 pp | ✓ Cumple |
| **ms-incidentes** | 29.9 % | **41.8 %** | +11.9 pp | Paquetes críticos altos |
| **ms-recursos** | 16.7 % | **22.3 %** | +5.6 pp | En mejora |
| **bff-rev** | 5.4 % | **8.9 %** | +3.5 pp | Plan Facade tests |

</div>

<div class="rev-panel" markdown="1">

| Paquete crítico | Cobertura v2 |
|-----------------|--------------|
| `incidentes.state` | **79.5 %** |
| `incidentes.correlacion` | **78.0 %** |
| `zonas.service` | **83.6 %** |
| `bff.security` | **42.9 %** |

</div>

<div class="rev-callout rev-callout--compact">JaCoCo global incluye controllers y DTOs; el foco de calidad está en **services**, **state** y **orquestación BFF**.</div>

</div>

<div class="rev-card">

**Reportes HTML**

- `ms-incidentes/target/site/jacoco/`
- `ms-zonas-riesgo/target/site/jacoco/`
- `ms-recursos/target/site/jacoco/`
- `bff-rev/target/site/jacoco/`

</div>

</div>

---

<!-- _class: dense slide-patterns-validated -->

# Patrones validados por la suite

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M4 3h8v3H4z"/><path d="M3 9h10v4H3z"/><path d="M6 6v3"/></svg><span>Diseño probado — no solo documentado</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--58-42">

<div markdown="1" class="rev-stack">

<div class="rev-pattern-list">

<div class="rev-pattern-row">
<div class="rev-pattern-row__label"><svg class="rev-pattern-row__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 3h8v3H4zM3 9h10v4H3z"/></svg>Factory + State</div>
<div class="rev-pattern-row__impl">IncidentStateFactory · *State</div>
<div class="rev-pattern-row__tests"><span class="rev-pattern-badge">UT-01</span><span class="rev-pattern-badge">UT-02</span><span class="rev-pattern-badge">UT-14…16</span></div>
</div>

<div class="rev-pattern-row rev-pattern-row--muted">
<div class="rev-pattern-row__label"><svg class="rev-pattern-row__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="5.5" y="9" width="5" height="5" rx="1"/></svg>Facade</div>
<div class="rev-pattern-row__impl">CorrelacionFacade · DashboardFacade</div>
<div class="rev-pattern-row__tests"><span class="rev-pattern-badge">UT-08</span><span class="rev-pattern-badge rev-pattern-badge--it">IT-04</span><span class="rev-pattern-badge">UT-25</span></div>
</div>

<div class="rev-pattern-row rev-pattern-row--accent">
<div class="rev-pattern-row__label"><svg class="rev-pattern-row__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 8h3M11 8h3M5 6l3 2-3 2M11 6l-3 2 3 2"/></svg>Adapter</div>
<div class="rev-pattern-row__impl">FakeWeatherAdapter → Port</div>
<div class="rev-pattern-row__tests"><span class="rev-pattern-badge">UT-06</span><span class="rev-pattern-badge">UT-07</span><span class="rev-pattern-badge">UT-20</span></div>
</div>

<div class="rev-pattern-row rev-pattern-row--muted">
<div class="rev-pattern-row__label"><svg class="rev-pattern-row__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="8" cy="4.5" rx="5" ry="2"/><path d="M3 4.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4"/></svg>Repository</div>
<div class="rev-pattern-row__impl">Spring Data JPA · cada MS</div>
<div class="rev-pattern-row__tests"><span class="rev-pattern-badge rev-pattern-badge--it">IT-01…06</span></div>
</div>

<div class="rev-pattern-row rev-pattern-row--accent">
<div class="rev-pattern-row__label"><svg class="rev-pattern-row__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 3 3 13M3 3l10 10"/></svg>Circuit Breaker</div>
<div class="rev-pattern-row__impl">Resilience4j · BFF</div>
<div class="rev-pattern-row__tests"><span class="rev-pattern-badge rev-pattern-badge--e2e">E2E-06</span><span class="rev-pattern-badge">DegradedAlert</span></div>
</div>

</div>

<div class="rev-chips">
<span class="rev-chip"><strong>Flujo</strong> Patrón → Código → Test → PASS</span>
<span class="rev-chip"><strong>UT-01</strong> bloquea EN_PROGRESO sin geo</span>
</div>

<div class="rev-callout rev-callout--compact">Nuevo estado = nueva clase <code>*State</code> + test — diseño y calidad evolucionan juntos.</div>

</div>

<div markdown="1" class="rev-diagram-col">


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-05.png" alt="Patrones de diseño REV" /></div>


<div class="rev-panel" markdown="1">

| Capa | Patrón bajo prueba |
|------|-------------------|
| ms-incidentes | Factory + State · Repository |
| bff-rev | Facade · Circuit Breaker |
| ms-zonas | Adapter · Repository |
| Integración | IT-04 orquestación Facade |

</div>

</div>

</div>

---

<!-- _class: dense -->

# Bugs detectados y correcciones

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/><circle cx="8" cy="8" r="6"/></svg><span>Pruebas que mejoraron el software</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-panel" markdown="1">

| Bug | Detectado por | Problema | Corrección |
|-----|---------------|----------|------------|
| **BUG-01** | UT-01 | EN_PROGRESO sin coordenadas | Validación en `IncidentStateFactory` |
| **BUG-02** | UT-05 | Doble asignación brigada/incidente | Código `ASIGNACION_DUPLICADA` |
| **BUG-03** | UT-08 | Revertir correlación con brigadas activas | `CorrelacionBloqueadaException` + reasignación BFF |
| **BUG-04** | E2E-03 | API operativa sin autenticación | `AuthenticationFilter` en Gateway |
| **BUG-05** | UT-05 | NPE en test por mock faltante | Mock `BrigadaBrigadistaRepository` |

</div>

<div class="rev-callout rev-callout--compact">Cada hallazgo generó **cambio en código de producción** o en la suite — trazabilidad bug → test → fix en el informe de pruebas.</div>

</div>

---

<!-- _class: dense slide-diag-media -->

# Pruebas end-to-end

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 8h3M11 8h3"/><path d="M5 6l3 2-3 2M11 6l-3 2 3 2"/></svg><span>Validación de punta a punta — operador y ciudadano</span></h2>

<div markdown="1" class="slide-workspace rev-split rev-split--55-45">

<div markdown="1" class="rev-stack">

<div class="rev-panel" markdown="1">

| ID | Escenario | Evidencia |
|----|-----------|-----------|
| **E2E-01** | Despacho: login → cola → asignar brigada | Video plataforma |
| **E2E-02** | Portal reporte → visible en cola despacho | Video plataforma |
| **E2E-03** | curl sin JWT → HTTP 401 | Video pruebas |
| **E2E-04** | Login + Bearer → HTTP 200 | Video pruebas |
| **E2E-05** | Correlaciones pendientes por proximidad | Video plataforma |
| **E2E-06** | Dashboard con alerta degraded | Demo resiliencia |

</div>

<div class="rev-chips">
<span class="rev-chip"><strong>Stack</strong> Docker Compose</span>
<span class="rev-chip"><strong>Arranque</strong> dev-up.ps1 -DockerApps</span>
<span class="rev-chip"><strong>UI</strong> localhost:15173</span>
</div>

<div class="rev-callout rev-callout--compact">Frontend validado por **E2E manual** — suite Vitest planificada como mejora futura.</div>

</div>


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-08.png" alt="Flujo portal ciudadano" /></div>


</div>

---

<!-- _class: dense -->

# Entregables del producto

<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 2h7l3 3v9H3z"/><path d="M10 2v3h3"/></svg><span>Arquitectura, código y evidencia de calidad</span></h2>

<div markdown="1" class="slide-workspace">

<div class="rev-deck rev-deck--3">

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Arquitectura</span><span class="rev-kpi__value">Diagrama + BFF + 3 MS</span><span class="rev-kpi__meta">Gateway · Eureka · Keycloak</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Persistencia</span><span class="rev-kpi__value">JPA + Flyway</span><span class="rev-kpi__meta">Database-per-service</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Frontend</span><span class="rev-kpi__value">React + Vite + TS</span><span class="rev-kpi__meta">package.json · README</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Backend</span><span class="rev-kpi__value">Spring Boot 4</span><span class="rev-kpi__meta">application.properties · README</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">API REST</span><span class="rev-kpi__value">Swagger / Postman</span><span class="rev-kpi__meta">Colección documentada</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Calidad</span><span class="rev-kpi__value">Informe + JaCoCo</span><span class="rev-kpi__meta">Matriz · plan · videos</span></div>
</div>

</div>

<div class="rev-callout">Repositorio: <strong>github.com/Barrolas/rev-fullstack</strong> · rama <code>dev</code> · documentación en <code>docs/informe-evidencias/eva3/</code></div>

</div>

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
- **32 pruebas automatizadas PASS** · JaCoCo v2

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

<div class="rev-result-card">
<div class="rev-result-card__head">Calidad</div>
<div class="rev-result-card__body" markdown="1">

- ms-zonas-riesgo **69.7 %** cobertura
- 5 bugs corregidos por pruebas
- Casos negativos en estado, correlación, seguridad
- Videos arquitectura · plataforma · pruebas

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
<div class="rev-kpi__glyph">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Solución moderna</span><span class="rev-kpi__value">Microservicios reales</span><span class="rev-kpi__meta">Discovery · BFF · IAM</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--muted">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Arquitectura adecuada</span><span class="rev-kpi__value">Picos · territorio</span><span class="rev-kpi__meta">PostGIS · JWT · CB</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Valor municipal</span><span class="rev-kpi__value">Conectividad que salva vidas</span><span class="rev-kpi__meta">Despacho + comunidad</span></div>
</div>

<div class="rev-kpi rev-kpi--icon">
<div class="rev-kpi__glyph rev-kpi__glyph--accent">></div>
<div class="rev-kpi__body"><span class="rev-kpi__label">Calidad verificada</span><span class="rev-kpi__value">32 tests PASS</span><span class="rev-kpi__meta">Unit · integración · E2E</span></div>
</div>

</div>

<div class="rev-panel" markdown="1">

| Criterio | Decisión REV |
|----------|--------------|
| Picos de crisis | MS escalables por dominio |
| Datos sensibles | Gateway perimetral + JWT |
| Fallos parciales | degraded + DegradedAlert |
| Evolución segura | Factory + State + suite trazable |

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


<div class="rev-diagram-img"><img src="presentacion-diagramas/diag-16.png" alt="Diagrama REV 16" /></div>


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

<p class="rev-closing-lead"><strong>REV</strong> integra despacho, territorio y comunidad en una plataforma cloud-native lista para operar: microservicios Spring Cloud, dashboard React, IAM Keycloak, resiliencia Resilience4j y <strong>evidencia de calidad</strong> con 32 pruebas automatizadas en flujos críticos.</p>

<div class="rev-closing-kpis">
<div class="rev-kpi"><span class="rev-kpi__label">Despacho</span><span class="rev-kpi__value">Unificado</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Ciudadanía</span><span class="rev-kpi__value">Portal 24/7</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Seguridad</span><span class="rev-kpi__value">JWT + Gateway</span></div>
<div class="rev-kpi"><span class="rev-kpi__label">Calidad</span><span class="rev-kpi__value">32 tests PASS</span></div>
</div>

<div class="rev-closing-cta">

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
