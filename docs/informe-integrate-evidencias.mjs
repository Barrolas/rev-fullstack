/**
 * Integra evidencias reales (imágenes + extractos de código) y corrige cortes A4.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const htmlPath = path.join(__dirname, 'informe-tecnico-integral-rev.html');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function codeFig(num, title, file, code, desc) {
  const lines = code.trim().split('\n');
  const shown = lines.length > 22 ? [...lines.slice(0, 22), '// …'] : lines;
  return `<figure class="fig-real">
  <p class="fig-num">Figura ${num}</p>
  <p class="fig-title">${title}</p>
  <p class="fig-file">${file}</p>
  <pre class="code-capture"><code>${esc(shown.join('\n'))}</code></pre>
  <p class="fig-desc">${desc}</p>
</figure>`;
}

function imgFig(num, title, src, desc, alt = title) {
  return `<figure class="fig-real">
  <p class="fig-num">Figura ${num}</p>
  <p class="fig-title">${title}</p>
  <img class="fig-img" src="${src}" alt="${esc(alt)}" loading="lazy" />
  <p class="fig-desc">${desc}</p>
</figure>`;
}

function appImgFig(num, title, src, desc, alt = title) {
  return `<figure class="fig-real">
  <p class="fig-num">Figura ${num}</p>
  <p class="fig-title">${title}</p>
  <img class="fig-img fig-img--app" src="${src}" alt="${esc(alt)}" loading="lazy" />
  <p class="fig-desc">${desc}</p>
</figure>`;
}

function configFig(num, title, file, code, desc) {
  return codeFig(num, title, file, code, desc);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// ── Portada: logo a color (fondo blanco) ──
html = html.replace(
  /src="\.\.\/frontend\/rev-dashboard\/public\/assets\/logos\/[^"]+"/,
  'src="../frontend/rev-dashboard/public/assets/logos/logo-horizontal-color.png"',
);
html = html.replace(
  /<img class="cover-logo-h"[^>]+>\s*(<div class="cover-rule">)/,
  `<img class="cover-logo-h" src="../frontend/rev-dashboard/public/assets/logos/logo-horizontal-color.png" alt="Red de Emergencia Valle" />
      <p class="cover-tagline">Conectividad que salva vidas</p>
      $1`,
);

// ── CSS: figuras reales, mermaid sin recorte en pantalla, índice ──
const cssInsert = `
    .fig-real { margin: 0.45rem 0; padding: 0; border: 1px solid var(--rev-border-strong); border-radius: 8px; overflow: hidden; background: #fff; break-inside: avoid; page-break-inside: avoid; }
    .fig-real .fig-num, .fig-real .fig-title, .fig-real .fig-desc, .fig-real .fig-file { padding-left: 0.55rem; padding-right: 0.55rem; }
    .fig-real .fig-num { padding-top: 0.45rem; margin: 0; }
    .fig-real .fig-title { margin: 0.15rem 0 0.25rem; font-weight: 600; color: var(--rev-text); font-size: 0.88rem; }
    .fig-real .fig-file { margin: 0 0 0.25rem; font-size: 7pt; color: var(--rev-text-tertiary); font-family: monospace; }
    .fig-real .fig-desc { margin: 0.35rem 0 0.45rem; font-size: 7.5pt; color: var(--rev-text-secondary); line-height: 1.4; }
    .fig-img { display: block; width: 100%; max-height: 58mm; object-fit: cover; object-position: top center; border-top: 1px solid var(--rev-border); border-bottom: 1px solid var(--rev-border); background: var(--rev-bg-secondary); }
    .fig-img--contain { object-fit: contain; max-height: 52mm; padding: 0.25rem; }
    pre.code-capture { margin: 0; border: none; border-radius: 0; border-top: 1px solid var(--rev-border); max-height: 52mm; overflow: hidden; font-size: 6.5pt; line-height: 1.35; }
    .git-evidence { margin: 0.35rem 0; padding: 0.5rem 0.65rem; background: #0d1117; color: #c9d1d9; border-radius: 6px; font-family: Consolas, monospace; font-size: 7pt; line-height: 1.45; white-space: pre-wrap; }
    @media screen {
      .page { height: auto; max-height: none; min-height: var(--a4-h); overflow: visible; }
      .sheet-main { overflow: visible; }
      .sheet-main .mermaid { max-height: none; overflow: visible; }
    }
    .sheet-main .mermaid svg { max-width: 100%; height: auto !important; }
`;

html = html.replace(
  /\.sheet-main \.toc--compact li \{ padding: 0\.22rem 0; \}/,
  `$&
    ${cssInsert}`,
);

html = html.replace(
  /\.sheet-main \.mermaid \{ margin: 0\.4rem 0; padding: 0\.45rem; max-height: 92mm; overflow: hidden; \}/,
  '.sheet-main .mermaid { margin: 0.35rem 0; padding: 0.4rem; max-height: 88mm; overflow: hidden; }\n    @media print { .sheet-main .mermaid { max-height: 88mm; } }',
);

// ── Mermaid: fuente más compacta ──
html = html.replace(
  /fontFamily: 'Segoe UI, Inter, system-ui, sans-serif' \} \}\);/,
  "fontFamily: 'Segoe UI, Inter, system-ui, sans-serif', fontSize: '11px' }, flowchart: { useMaxWidth: true, htmlLabels: true, padding: 8 }, sequence: { useMaxWidth: true, wrap: true } });",
);

// ── Separar resumen e índice (evitar corte del TOC) ──
const tocBlock = html.match(/<h2 style="font-size:1rem[^]*?<\/ol>\s*/)?.[0];
if (tocBlock) {
  html = html.replace(tocBlock, '');
  html = html.replace(
    /Resumen ejecutivo e índice/,
    'Resumen ejecutivo',
  );
  const indicePage = `<section class="page page-break" id="indice">
  <header class="sheet-head"><span class="sheet-head__brand">REV · Informe Técnico</span><span class="sheet-head__title">Tabla de contenidos</span></header>
  <div class="sheet-main sheet-main--flow">
<h1>Tabla de contenidos</h1>
${tocBlock.replace(/<h2 style="font-size:1rem[^]*?<\/h2>\s*/, '')}
  </div>
  <footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV</span><span class="sheet-foot__num"></span></footer>
</section>

`;
  html = html.replace(
    /(<section class="page page-break" id="resumen">[\s\S]*?<\/section>\s*\n)/,
    `$1\n${indicePage}`,
  );
}

html = html.replace(/actualización v1\.3/, 'actualización v1.4');
html = html.replace(
  /1\.3 — paginación equilibrada/,
  '1.4 — evidencias integradas',
);

// ── Reemplazar placeholders por evidencia ──
function replaceFig(numPattern, replacement) {
  const re = new RegExp(
    `<div class="fig-placeholder(?: fig-placeholder--sm)?">[\\s\\S]*?Figura ${numPattern}[\\s\\S]*?<\\/div>`,
    'g',
  );
  html = html.replace(re, replacement);
}

replaceFig(
  '1',
  codeFig(
    1,
    'Arquetipo Maven rev-microservice-archetype',
    'archetypes/rev-microservice-archetype/',
    `# Estructura generada
src/main/java/cl/duocuc/rev/__artifactId__/
  __artifactId__Application.java   # @EnableDiscoveryClient
  controller/
  service/
  repository/
  entity/
  dto/
src/main/resources/application.properties
pom.xml`,
    'Árbol estándar del arquetipo custom REV. Acelera nuevos MS alineados a Eureka y Actuator.',
  ),
);

replaceFig(
  '2',
  codeFig(
    2,
    'IncidentStateFactory — Factory Method',
    'businessdomain/ms-incidentes/.../state/IncidentStateFactory.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/state/IncidentStateFactory.java'),
    'Resuelve el handler según <code>EstadoIncidente</code> actual; evita switches dispersos al validar transiciones.',
  ),
);

replaceFig(
  '3',
  codeFig(
    3,
    'State — ReportadoState y regla requireGeo',
    'businessdomain/ms-incidentes/.../state/',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/state/ReportadoState.java') +
      '\n\n// Handlers registrados: ReportadoState, EnProgresoState,\n// ControladoState, EscaladoState, FinalizadoState',
    'Patrón State: transición a EN_PROGRESO exige georreferenciación (<code>requireGeo</code>).',
  ),
);

replaceFig(
  '4',
  codeFig(
    4,
    'Adapter — WeatherDataPort y FakeWeatherAdapter',
    'businessdomain/ms-zonas-riesgo/.../adapter/',
    read('businessdomain/ms-zonas-riesgo/src/main/java/cl/duocuc/rev/zonas/port/WeatherDataPort.java') +
      '\n\n' +
      read('businessdomain/ms-zonas-riesgo/src/main/java/cl/duocuc/rev/zonas/adapter/FakeWeatherAdapter.java'),
    'Puerto hexagonal + adaptador simulado; sustituible por API meteorológica real sin cambiar <code>ZonaService</code>.',
  ),
);

replaceFig(
  '5',
  codeFig(
    5,
    'Facade — DashboardFacadeService.construirDashboard',
    'infraestructuredomain/bff-rev/.../DashboardFacadeService.java',
    read('infraestructuredomain/bff-rev/src/main/java/cl/duocuc/rev/bff/service/DashboardFacadeService.java').slice(550, 2200),
    'Agrega incidente, zona de riesgo y recursos con flag <code>degraded</code>; anotaciones <code>@CircuitBreaker</code> en métodos remotos.',
  ),
);

replaceFig(
  '6',
  codeFig(
    6,
    'Repository — IncidenteRepository (Spring Data JPA)',
    'businessdomain/ms-incidentes/.../IncidenteRepository.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/repository/IncidenteRepository.java'),
    'Abstrae persistencia PostgreSQL; incluye consulta geoespacial para correlación de candidatos.',
  ),
);

replaceFig(
  '7',
  codeFig(
    7,
    'Builder — DashboardResponse (@Builder Lombok)',
    'infraestructuredomain/bff-rev/.../dto/DashboardResponse.java',
    read('infraestructuredomain/bff-rev/src/main/java/cl/duocuc/rev/bff/dto/DashboardResponse.java'),
    'DTO de agregación del BFF construido con patrón Builder de Lombok.',
  ),
);

replaceFig(
  '7b',
  appImgFig(
    '7b',
    'Correlaciones — vista operacional (referencia UI)',
    'informe-evidencias/fig15b-zonas.png',
    'Captura real de <code>/zonas</code> — módulo territorial con Leaflet/PostGIS.',
    'Zonas REV',
  ),
);

const gitBranches = `* dev
  feature/frontend-inicio-portal-docs-eva2
  main
  remotes/origin/dev
  remotes/origin/main
  remotes/origin/feature/public-report-incidente-login
  remotes/origin/feature/ms-incidentes-correlacion-backend`;

replaceFig(
  '8',
  `<figure class="fig-real"><p class="fig-num">Figura 8</p><p class="fig-title">Repositorio — ramas main y dev</p><div class="git-evidence">${esc(gitBranches)}</div><p class="fig-desc">Salida de <code>git branch -a</code> en <code>rev-fullstack</code>. Estrategia GitFlow simplificado documentada en <code>docs/CONTRIBUTING.md</code>.</p></figure>`,
);

replaceFig(
  '9',
  `<figure class="fig-real"><p class="fig-num">Figura 9</p><p class="fig-title">Historial reciente — integración continua</p><div class="git-evidence">${esc(`df4dd37 [ DOCS ]: Actualizar mapa de ramas y hashes en estrategia EVA2
b347d18 [ DOCS ]: Documentar correlacion, troubleshooting login
718460d [ FEAT ]: Formulario interno y reporte publico con mapa OSM`)}</div><p class="fig-desc">Commits atómicos formato <code>[ TIPO ]: descripción</code> en rama <code>dev</code>. CI en <code>.github/workflows/ci.yml</code>.</p></figure>`,
);

replaceFig(
  '10',
  configFig(
    10,
    'Keycloak — realm rev (roles y usuarios)',
    'docker/keycloak/rev-realm.json',
    read('docker/keycloak/rev-realm.json').slice(0, 1200),
    'Realm importado al arrancar Keycloak. Roles: Despachador, Brigadista, Admin, Ciudadano.',
  ),
);

replaceFig(
  '11',
  codeFig(
    11,
    'AuthenticationFilter — API Gateway',
    'infraestructuredomain/api-gateway/.../AuthenticationFilter.java',
    read('infraestructuredomain/api-gateway/src/main/java/cl/duocuc/rev/gateway/filter/AuthenticationFilter.java').slice(0, 1800),
    'Filtro JWT: valida Bearer y consulta <code>KEYCLOAK-ADAPTER/roles</code> vía Eureka.',
  ),
);

replaceFig(
  '12',
  codeFig(
    12,
    'JwtService — validación JWK Set',
    'infraestructuredomain/keycloak-adapter/.../JwtService.java',
    read('infraestructuredomain/keycloak-adapter/src/main/java/cl/duocuc/rev/keycloak/service/JwtService.java'),
    'Obtiene claves públicas RSA del realm Keycloak para validar tokens JWT.',
  ),
);

replaceFig(
  '13',
  configFig(
    13,
    'Flyway — esquema inicial ms-incidentes',
    'businessdomain/ms-incidentes/.../V1__init_incidentes.sql',
    read('businessdomain/ms-incidentes/src/main/resources/db/migration/V1__init_incidentes.sql'),
    'Migración versionada: tablas <code>incidentes</code> y <code>transiciones_estado</code> (auditoría de ciclo de vida).',
  ),
);

replaceFig(
  '14',
  appImgFig(
    14,
    'Dashboard Despacho — panel operacional',
    'informe-evidencias/fig14-dispatch.png',
    'Captura real de <code>/</code> con sesión despachador: KPIs, incidente activo y módulos Zonas/Recursos.',
    'Dashboard Despacho REV',
  ),
);

replaceFig(
  '15',
  appImgFig(
    15,
    'Módulo Incidentes — listado y correlaciones',
    'informe-evidencias/fig15-incidentes.png',
    'Captura real de <code>/incidentes</code>: filtros, vista listado y panel de distribución.',
    'Módulo Incidentes REV',
  ),
);

replaceFig(
  '16',
  appImgFig(
    16,
    'Login — pestaña Reportar emergencia',
    'informe-evidencias/fig16-login-reporte.png',
    'Captura real de <code>/login</code>: formulario por pasos, mapa OSM y guía ciudadana.',
    'Login REV — reporte público',
  ),
);

replaceFig(
  '16b',
  appImgFig(
    '16b',
    'Portal ciudadano — reporte en terreno',
    'informe-evidencias/fig16b-portal.png',
    'Captura real de <code>/portal</code>: landing pública sin registro previo.',
    'Portal REV',
  ),
);

replaceFig(
  '17',
  configFig(
    17,
    'Eureka Server — service discovery',
    'infraestructuredomain/eureka-server/.../application.properties',
    read('infraestructuredomain/eureka-server/src/main/resources/application.properties') +
      '\n\n# Registro en docker-compose.yml\n# eureka-server :18761 → 8761\n# MS registrados: MS-INCIDENTES, MS-ZONAS-RIESGO,\n# MS-RECURSOS, BFF-REV, KEYCLOAK-ADAPTER, api-gateway',
    'Servidor Eureka en puerto 8761 (host 18761). Gateway usa rutas <code>lb://BFF-REV</code>.',
  ),
);

replaceFig(
  '18',
  configFig(
    18,
    'Spring Boot Admin — monitorización',
    'infraestructuredomain/spring-boot-admin/',
    `# docker-compose.yml (perfil apps)
spring-boot-admin:
  container_name: rev-spring-boot-admin
  ports:
    - "18099:8099"
  depends_on:
    - eureka-server

# @EnableAdminServer en spring-boot-admin
# Expone health de microservicios registrados en Eureka`,
    'Monitor centralizado de Actuators (:8099). Complementa health/info/circuitbreakers del BFF.',
  ),
);

replaceFig(
  '19',
  codeFig(
    19,
    'OpenAPI — IncidenteController (ms-incidentes)',
    'businessdomain/ms-incidentes/.../IncidenteController.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/controller/IncidenteController.java').slice(0, 1600),
    'Endpoints REST documentados vía springdoc-openapi en runtime (<code>/swagger-ui.html</code> :8081).',
  ),
);

replaceFig(
  '20',
  configFig(
    20,
    'Docker Compose — stack REV',
    'docker-compose.yml',
    read('docker-compose.yml').slice(0, 2000),
    'Orquestación local: 3 PostgreSQL/PostGIS, Keycloak, Eureka, MS, BFF, Gateway y Spring Boot Admin (perfil <code>apps</code>).',
  ),
);

// ── Partir cap13 si quedó muy denso (UX + infra en páginas separadas) ──
const cap13Split = `<section class="page page-break" id="cap13-2">
  <header class="sheet-head"><span class="sheet-head__brand">REV · Informe Técnico</span><span class="sheet-head__title">Cap. 13 — Evidencias infra (2/2)</span></header>
  <div class="sheet-main">
  <h3>Infraestructura y operación (figuras 17–20)</h3>`;

if (html.includes('id="cap13"') && html.includes('Figura 17')) {
  html = html.replace(
    /\s*<h3>Infraestructura y operación \(figuras 17–20\)<\/h3>\s*<div class="fig-grid">/,
    `</div>
  <footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV</span><span class="sheet-foot__num"></span></footer>
</section>

${cap13Split}
  <div class="fig-grid">`,
  );
}

// Contar páginas
const pageCount = (html.match(/<section class="page/g) || []).length;
html = html.replace(/<strong>\d+ hojas A4<\/strong>/, `<strong>${pageCount} hojas A4</strong>`);

fs.writeFileSync(htmlPath, html);
console.log('Evidencias integradas. Páginas:', pageCount);
