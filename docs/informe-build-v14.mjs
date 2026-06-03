/**
 * Construye informe v1.4: tema claro A4, paginación equilibrada, evidencias reales.
 * Uso: node docs/informe-build-v14.mjs
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

function trimCode(code, max = 22) {
  const lines = code.trim().split('\n');
  return lines.length > max ? [...lines.slice(0, max), '// …'].join('\n') : lines.join('\n');
}

function codeFig(num, title, file, code, desc) {
  return `<figure class="fig-real">
  <p class="fig-num">Figura ${num}</p>
  <p class="fig-title">${title}</p>
  <p class="fig-file">${file}</p>
  <pre class="code-capture"><code>${esc(trimCode(code))}</code></pre>
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

function gitFig(num, title, text, desc) {
  return `<figure class="fig-real"><p class="fig-num">Figura ${num}</p><p class="fig-title">${title}</p><div class="git-evidence">${esc(text.trim())}</div><p class="fig-desc">${desc}</p></figure>`;
}

function foot() {
  return `  <footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV</span><span class="sheet-foot__num"></span></footer>\n</section>`;
}

function wrap(id, title, inner, opts = {}) {
  const mainCls = opts.tight ? 'sheet-main sheet-main--tight' : 'sheet-main';
  return `<section class="page page-break" id="${id}">
  <header class="sheet-head"><span class="sheet-head__brand">REV · Informe Técnico</span><span class="sheet-head__title">${title}</span></header>
  <div class="${mainCls}">
${inner.trim()}
  </div>
${foot()}`;
}

function stripSection(html) {
  return html
    .replace(/\s*<div class="header-bar">[\s\S]*?<\/div>\s*/g, '\n')
    .trim();
}

let src = fs.readFileSync(htmlPath, 'utf8');
const sections = new Map();
const secRe = /<section class="page[^"]*" id="([^"]+)">([\s\S]*?)<\/section>/g;
let m;
while ((m = secRe.exec(src)) !== null) {
  sections.set(m[1], stripSection(m[2]));
}

function c(id) {
  const v = sections.get(id);
  if (!v) throw new Error(`Missing section ${id}`);
  return v;
}

function sliceFrom(html, start, end) {
  const s = html.indexOf(start);
  if (s < 0) return html;
  const e = end ? html.indexOf(end, s) : -1;
  return e >= 0 ? html.slice(s, e) : html.slice(s);
}

// ── Capítulos con splits inteligentes ──
const cap3 = c('cap3');
const cap3mEnd = cap3.indexOf('</div>', cap3.indexOf('<div class="mermaid">')) + 6;
const cap5 = c('cap5');
const cap9 = c('cap9');
const cap12 = c('cap12');
const cap13 = c('cap13');

const pages = [
  wrap('resumen', 'Resumen ejecutivo', c('resumen')),
  wrap('indice', 'Tabla de contenidos', c('indice')),
  wrap('cap1', 'Cap. 1 — Introducción', c('cap1')),
  wrap('cap2', 'Cap. 2 — Descripción general', c('cap2')),
  wrap('cap3', 'Cap. 3 — Arquitectura (1/2)', cap3.slice(0, cap3mEnd)),
  wrap('cap3-2', 'Cap. 3 — Arquitectura (2/2)', cap3.slice(cap3.indexOf('<h3>3.2'))),
  wrap('cap4', 'Cap. 4 — Arquetipos (1/2)', sliceFrom(c('cap4'), '<h1>', '<h3>4.2')),
  wrap('cap4-2', 'Cap. 4 — Arquetipos (2/2)', sliceFrom(c('cap4'), '<h3>4.2')),
  wrap('cap5', 'Cap. 5 — Patrones (1/2)', sliceFrom(cap5, '<h1>', '<h3>5.3')),
  wrap('cap5-2', 'Cap. 5 — Patrones (2/2)', sliceFrom(cap5, '<h3>5.3')),
  wrap('cap6', 'Cap. 6 — Patrones arquitectónicos', c('cap6')),
  wrap('cap7', 'Cap. 7 — Branching', c('cap7')),
  wrap('cap8', 'Cap. 8 — Buenas prácticas', c('cap8')),
  wrap('cap9', 'Cap. 9 — Seguridad (1/2)', sliceFrom(cap9, '<h1>', '<h3>9.2'), { tight: true }),
  wrap('cap9-2', 'Cap. 9 — Seguridad (2/2)', sliceFrom(cap9, '<h3>9.2')),
  wrap('cap10', 'Cap. 10 — Observabilidad', c('cap10')),
  wrap('cap11', 'Cap. 11 — Base de datos (1/2)', sliceFrom(c('cap11'), '<h1>', '<div class="mermaid">')),
  wrap('cap11-2', 'Cap. 11 — Base de datos (2/2)', sliceFrom(c('cap11'), '<div class="mermaid">')),
  wrap('cap12', 'Cap. 12 — UX/UI', cap12),
  wrap('cap13', 'Cap. 13 — Evidencias (1/2)', sliceFrom(cap13, '<h1>', '<h3') || cap13),
  wrap('cap13-2', 'Cap. 13 — Evidencias (2/2)', cap13.includes('<table>') ? '' : cap13),
  wrap('cap14', 'Cap. 14 — Conclusiones', c('cap14')),
];

// cap13 split: table vs figs
const cap13full = c('cap13');
const cap13tableEnd = cap13full.indexOf('</table>') + 8;
pages[pages.length - 3] = wrap(
  'cap13',
  'Cap. 13 — Evidencias (1/2)',
  cap13full.slice(0, cap13tableEnd) +
    `\n  <h3>Capturas UX (figuras 14–16)</h3>\n  <div class="fig-grid">\n    <!-- UX figs injected -->\n  </div>`,
);
pages[pages.length - 2] = wrap(
  'cap13-2',
  'Cap. 13 — Evidencias (2/2)',
  `<h3>Infraestructura (figuras 17–20)</h3>\n  <div class="fig-grid">\n    <!-- infra figs injected -->\n  </div>`,
);

let body = pages.join('\n\n');

// ── Evidencias (orden descendente para evitar colisiones Figura 1 vs 10) ──
const figs = {
  '20': codeFig(
    20,
    'Docker Compose — stack REV',
    'docker-compose.yml',
    read('docker-compose.yml').slice(0, 1900),
    'Orquestación local: PostgreSQL ×3, Keycloak, Eureka, MS, BFF, Gateway (perfil <code>apps</code>).',
  ),
  '19': codeFig(
    19,
    'OpenAPI — IncidenteController',
    'ms-incidentes/.../IncidenteController.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/controller/IncidenteController.java').slice(0, 1500),
    'Endpoints REST documentados vía springdoc en runtime.',
  ),
  '18': codeFig(
    18,
    'Spring Boot Admin',
    'docker-compose.yml + @EnableAdminServer',
    `# spring-boot-admin :18099 → 8099\ndepends_on:\n  - eureka-server`,
    'Monitor centralizado de Actuators registrados en Eureka.',
  ),
  '17': codeFig(
    17,
    'Eureka Server',
    'eureka-server/application.properties',
    read('infraestructuredomain/eureka-server/src/main/resources/application.properties') +
      '\n# Gateway: lb://BFF-REV, lb://KEYCLOAK-ADAPTER',
    'Service discovery en puerto 8761 (host 18761).',
  ),
  '16b': imgFig(
    '16b',
    'Portal ciudadano',
    'informe-evidencias/fig16b-portal.png',
    'Canal público — asset <code>rev-about-portal.png</code>.',
  ),
  '16': imgFig(
    16,
    'Login — hero y reporte',
    'informe-evidencias/fig16-login.jpg',
    'Pantalla de acceso con canal ciudadano — <code>login-hero.jpg</code>.',
  ),
  '15': imgFig(
    15,
    'Zonas e incidentes — mapa',
    'informe-evidencias/fig15-zonas.png',
    'Visualización territorial — <code>rev-about-map.png</code>.',
  ),
  '14': imgFig(
    14,
    'Dashboard Despacho',
    'informe-evidencias/fig14-dispatch.png',
    'Centro de operaciones — <code>rev-about-dispatch.png</code>.',
  ),
  '13': codeFig(
    13,
    'Flyway V1 — ms-incidentes',
    'V1__init_incidentes.sql',
    read('businessdomain/ms-incidentes/src/main/resources/db/migration/V1__init_incidentes.sql'),
    'Esquema inicial y tabla <code>transiciones_estado</code>.',
  ),
  '12': codeFig(
    12,
    'JwtService — JWK Set',
    'keycloak-adapter/.../JwtService.java',
    read('infraestructuredomain/keycloak-adapter/src/main/java/cl/duocuc/rev/keycloak/service/JwtService.java'),
    'Validación RSA256 con claves públicas del realm Keycloak.',
  ),
  '11': codeFig(
    11,
    'AuthenticationFilter — Gateway',
    'api-gateway/.../AuthenticationFilter.java',
    read('infraestructuredomain/api-gateway/src/main/java/cl/duocuc/rev/gateway/filter/AuthenticationFilter.java').slice(0, 1700),
    'Filtro JWT perimetral vía <code>KEYCLOAK-ADAPTER/roles</code>.',
  ),
  '10': codeFig(
    10,
    'Keycloak realm rev',
    'docker/keycloak/rev-realm.json',
    read('docker/keycloak/rev-realm.json').slice(0, 1100),
    'Roles Despachador, Brigadista, Admin, Ciudadano importados al arranque.',
  ),
  '9': gitFig(
    9,
    'Historial reciente — rama dev',
    `df4dd37 [ DOCS ]: Actualizar mapa de ramas EVA2\nb347d18 [ DOCS ]: Documentar correlacion y login\n718460d [ FEAT ]: Reporte publico con mapa OSM`,
    'Commits atómicos <code>[ TIPO ]: descripción</code> — CI en GitHub Actions.',
  ),
  '8': gitFig(
    8,
    'Ramas Git — rev-fullstack',
    `* dev\n  main\n  remotes/origin/dev\n  remotes/origin/main\n  remotes/origin/feature/public-report-incidente-login`,
    'GitFlow simplificado: <code>main</code> estable, <code>dev</code> integración.',
  ),
  '7b': imgFig(
    '7b',
    'Referencia UI — mapa operacional',
    'informe-evidencias/fig15-zonas.png',
    'Complemento visual del ecosistema REV (módulo territorial).',
  ),
  '7': codeFig(
    7,
    'Builder — DashboardResponse',
    'bff-rev/dto/DashboardResponse.java',
    read('infraestructuredomain/bff-rev/src/main/java/cl/duocuc/rev/bff/dto/DashboardResponse.java'),
    'DTO agregado del BFF con <code>@Builder</code> Lombok.',
  ),
  '6': codeFig(
    6,
    'Repository — IncidenteRepository',
    'ms-incidentes/.../IncidenteRepository.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/repository/IncidenteRepository.java'),
    'Spring Data JPA + consulta geoespacial para correlación.',
  ),
  '5': codeFig(
    5,
    'Facade — DashboardFacadeService',
    'bff-rev/.../DashboardFacadeService.java',
    read('infraestructuredomain/bff-rev/src/main/java/cl/duocuc/rev/bff/service/DashboardFacadeService.java').slice(400, 2100),
    'Agregación con <code>@CircuitBreaker</code> y flag <code>degraded</code>.',
  ),
  '4': codeFig(
    4,
    'Adapter — FakeWeatherAdapter',
    'ms-zonas-riesgo/adapter/',
    read('businessdomain/ms-zonas-riesgo/src/main/java/cl/duocuc/rev/zonas/port/WeatherDataPort.java') +
      '\n\n' +
      read('businessdomain/ms-zonas-riesgo/src/main/java/cl/duocuc/rev/zonas/adapter/FakeWeatherAdapter.java'),
    'Puerto + adaptador simulado intercambiable.',
  ),
  '3': codeFig(
    3,
    'State — ReportadoState',
    'ms-incidentes/.../state/ReportadoState.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/state/ReportadoState.java') +
      '\n// + EnProgresoState, ControladoState, EscaladoState',
    'Transición EN_PROGRESO exige georreferenciación.',
  ),
  '2': codeFig(
    2,
    'Factory Method — IncidentStateFactory',
    'ms-incidentes/.../IncidentStateFactory.java',
    read('businessdomain/ms-incidentes/src/main/java/cl/duocuc/rev/incidentes/state/IncidentStateFactory.java'),
    'Resuelve handler por estado actual vía <code>EnumMap</code>.',
  ),
  '1': codeFig(
    1,
    'Arquetipo Maven REV',
    'archetypes/rev-microservice-archetype/',
    read('archetypes/rev-microservice-archetype/src/main/resources/META-INF/maven/archetype-metadata.xml').slice(0, 800),
    'Descriptor del arquetipo custom para nuevos microservicios.',
  ),
};

function replaceFig(body, num, html) {
  const re = new RegExp(
    `<div class="fig-placeholder[^"]*">\\s*<p class="fig-num">Figura ${num.replace('.', '\\.')}<\\/p>[\\s\\S]*?<\\/div>`,
    'g',
  );
  return body.replace(re, html);
}

for (const num of Object.keys(figs).sort((a, b) => {
  const na = parseFloat(a.replace('b', '.5'));
  const nb = parseFloat(b.replace('b', '.5'));
  return nb - na;
})) {
  body = replaceFig(body, num, figs[num]);
}

// Inyectar figuras UX/infra en cap13
body = body.replace(
  '<!-- UX figs injected -->',
  [figs['14'], figs['15'], figs['16'], figs['16b']].join('\n    '),
);
body = body.replace(
  '<!-- infra figs injected -->',
  [figs['17'], figs['18'], figs['19'], figs['20']].join('\n    '),
);

const cover = `<section class="page page--cover page-break" id="portada">
  <div class="cover-layout">
    <div class="cover-band">
      <span>Municipalidad de Valle del Sol</span>
      <span class="cover-band__badge">DSY1106 · EVA2</span>
    </div>
    <div class="cover-hero">
      <img class="cover-logo-h" src="../frontend/rev-dashboard/public/assets/logos/logo-horizontal-color.png" alt="Red de Emergencia Valle" />
      <p class="cover-tagline">Conectividad que salva vidas</p>
      <div class="cover-rule"></div>
      <p class="cover-doc-type">Informe técnico integral</p>
      <h1 class="cover-h1">Arquitectura, Patrones y Ecosistemas de Microservicios</h1>
      <p class="cover-h2">Documentación verificada del ecosistema REV — monorepo <code>rev-fullstack</code></p>
    </div>
    <div class="cover-meta">
      <div class="cover-meta__item"><span class="cover-meta__label">Asignatura</span><span class="cover-meta__value">Desarrollo Fullstack III</span></div>
      <div class="cover-meta__item"><span class="cover-meta__label">Código</span><span class="cover-meta__value">DSY1106 — Duoc UC</span></div>
      <div class="cover-meta__item"><span class="cover-meta__label">Integrantes</span><span class="cover-meta__value">Nicolás Barra · Giannina Guerrero</span></div>
      <div class="cover-meta__item"><span class="cover-meta__label">Profesor(a)</span><span class="cover-meta__value">Israel Alejandro Villagra Riquelme</span></div>
      <div class="cover-meta__item"><span class="cover-meta__label">Fecha</span><span class="cover-meta__value">Mayo 2026</span></div>
      <div class="cover-meta__item"><span class="cover-meta__label">Versión</span><span class="cover-meta__value">1.4 — evidencias integradas · rama dev</span></div>
    </div>
    <div class="cover-bottom"><strong>REV</strong> · Informe académico EVA2 · Formato A4 (210 × 297 mm)</div>
  </div>
</section>`;

const head = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Informe Técnico Integral — REV</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'base', themeVariables: { primaryColor: '#EEF2F7', primaryTextColor: '#0B172A', primaryBorderColor: '#F97316', lineColor: '#64748B', fontSize: '11px' }, flowchart: { useMaxWidth: true, padding: 8 }, sequence: { useMaxWidth: true, wrap: true } });</script>
  <style>
    :root {
      --rev-navy: #07111F; --rev-navy-mid: #0B172A; --rev-navy-soft: #10233E;
      --rev-orange: #F97316; --rev-orange-hover: #EA580C; --rev-orange-muted: rgba(249,115,22,0.12);
      --rev-bg: #FFFFFF; --rev-bg-secondary: #F8FAFC; --rev-surface: #EEF2F7;
      --rev-text: #0B172A; --rev-text-secondary: #475569; --rev-text-tertiary: #64748B;
      --rev-border: rgba(11,23,42,0.1); --rev-border-strong: rgba(11,23,42,0.16);
      --a4-w: 210mm; --a4-h: 297mm;
    }
    @page { size: 210mm 297mm; margin: 15mm 18mm; }
    * { box-sizing: border-box; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body.informe-rev { margin: 0; font-family: 'Segoe UI', Inter, system-ui, sans-serif; background: #94A3B8; color: var(--rev-text); line-height: 1.55; font-size: 10.5pt; counter-reset: sheet-num; }
    .page { width: var(--a4-w); margin: 0 auto 10mm; background: var(--rev-bg); box-shadow: 0 6px 28px rgba(11,23,42,0.12); border: 1px solid var(--rev-border-strong); display: flex; flex-direction: column; counter-increment: sheet-num; }
    .page-break { break-after: page; page-break-after: always; }
    .page--cover { counter-increment: none; border: none; min-height: var(--a4-h); }
    .cover-layout { display: flex; flex-direction: column; min-height: var(--a4-h); background: #fff; }
    .cover-band { display: flex; justify-content: space-between; align-items: center; padding: 5mm 14mm; background: var(--rev-navy); color: rgba(255,255,255,0.88); font-size: 7.5pt; letter-spacing: 0.12em; text-transform: uppercase; }
    .cover-band__badge { padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--rev-orange); color: #fff; font-weight: 700; }
    .cover-hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8mm 14mm; background: linear-gradient(180deg,#fff 0%,var(--rev-bg-secondary) 100%); }
    .cover-logo-h { width: min(165mm,94%); max-height: 24mm; object-fit: contain; margin-bottom: 3mm; }
    .cover-tagline { margin: 0; font-size: 9pt; font-style: italic; color: var(--rev-text-secondary); }
    .cover-rule { width: 48px; height: 3px; margin: 4mm auto; background: var(--rev-orange); border-radius: 2px; }
    .cover-doc-type { margin: 0; font-size: 8pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--rev-orange); }
    .cover-h1 { margin: 2mm 0 3mm; font-size: 1.55rem; font-weight: 700; color: var(--rev-navy); max-width: 155mm; line-height: 1.2; }
    .cover-h2 { margin: 0; font-size: 10pt; color: var(--rev-text-secondary); max-width: 140mm; }
    .cover-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 6mm; padding: 5mm 14mm; background: var(--rev-bg-secondary); border-top: 1px solid var(--rev-border-strong); }
    .cover-meta__item { padding: 2.5mm 3mm; background: #fff; border: 1px solid var(--rev-border); border-radius: 6px; border-left: 3px solid var(--rev-orange); }
    .cover-meta__label { display: block; font-size: 6.5pt; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rev-text-tertiary); }
    .cover-meta__value { display: block; font-size: 8.5pt; color: var(--rev-text); }
    .cover-bottom { padding: 3mm 14mm 6mm; text-align: center; font-size: 7pt; background: var(--rev-navy); color: rgba(255,255,255,0.75); }
    .sheet-head { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 8mm 16mm 3mm; border-bottom: 2px solid var(--rev-orange); background: linear-gradient(180deg,var(--rev-bg-secondary),var(--rev-bg)); }
    .sheet-head__brand { font-size: 7.5pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--rev-navy-soft); }
    .sheet-head__title { font-size: 7.5pt; color: var(--rev-text-tertiary); }
    .sheet-main { flex: 1; padding: 5mm 16mm 3mm; min-height: 0; }
    .sheet-foot { flex-shrink: 0; display: flex; justify-content: space-between; padding: 3mm 16mm 7mm; border-top: 1px solid var(--rev-border); font-size: 7pt; color: var(--rev-text-tertiary); }
    .sheet-foot__num::before { content: counter(sheet-num); }
    .sheet-main h1 { font-size: 1.45rem; margin: 0 0 0.65rem; }
    .sheet-main h3 { margin-top: 0.85rem; margin-bottom: 0.35rem; font-size: 0.95rem; color: var(--rev-navy-mid); }
    .sheet-main p, .sheet-main li { margin: 0.35rem 0; font-size: 10pt; color: var(--rev-text-secondary); }
    .sheet-main table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 8.5pt; }
    .sheet-main th { background: var(--rev-navy-soft); color: #fff; padding: 0.35rem 0.5rem; border: 1px solid var(--rev-navy-soft); }
    .sheet-main td { padding: 0.35rem 0.5rem; border: 1px solid var(--rev-border); vertical-align: top; }
    tr:nth-child(even) td { background: var(--rev-bg-secondary); }
    .exec-box, .chapter-intro, .chapter-end { margin: 0.5rem 0; padding: 0.55rem 0.75rem; border-radius: 8px; }
    .exec-box { background: var(--rev-bg-secondary); border-left: 4px solid var(--rev-orange); }
    .chapter-intro { border-left: 3px solid var(--rev-orange); background: var(--rev-orange-muted); font-style: italic; }
    .chapter-end { background: var(--rev-orange-muted); border: 1px solid rgba(249,115,22,0.25); }
    .chapter-end strong { color: var(--rev-orange-hover); }
    pre, code { font-family: Consolas, monospace; }
    pre { background: var(--rev-bg-secondary); border-left: 3px solid var(--rev-orange); padding: 0.55rem 0.65rem; font-size: 7pt; overflow-x: auto; }
    code { background: var(--rev-surface); padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.9em; }
    .mermaid { background: var(--rev-bg-secondary); border: 1px solid var(--rev-border); border-radius: 8px; padding: 0.45rem; margin: 0.4rem 0; overflow: visible; }
    .mermaid svg { max-width: 100% !important; height: auto !important; }
    .toc { list-style: none; padding: 0; }
    .toc li { padding: 0.28rem 0; border-bottom: 1px dotted var(--rev-border); }
    .toc a { color: var(--rev-text-secondary); text-decoration: none; }
    .toc-l2 { padding-left: 1.1rem; font-size: 9pt; }
    .fig-real { margin: 0.4rem 0; border: 1px solid var(--rev-border-strong); border-radius: 8px; overflow: hidden; break-inside: avoid; }
    .fig-real .fig-num { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rev-orange); font-weight: 700; padding: 0.4rem 0.55rem 0; margin: 0; }
    .fig-real .fig-title { margin: 0.1rem 0.25rem; padding: 0 0.55rem; font-weight: 600; font-size: 0.88rem; color: var(--rev-text); }
    .fig-real .fig-file { margin: 0 0 0.2rem; padding: 0 0.55rem; font-size: 7pt; color: var(--rev-text-tertiary); font-family: monospace; }
    .fig-real .fig-desc { margin: 0.3rem 0 0.45rem; padding: 0 0.55rem; font-size: 7.5pt; color: var(--rev-text-secondary); }
    .fig-img { display: block; width: 100%; max-height: 55mm; object-fit: cover; object-position: top; border-top: 1px solid var(--rev-border); border-bottom: 1px solid var(--rev-border); }
    pre.code-capture { margin: 0; border: none; border-radius: 0; border-top: 1px solid var(--rev-border); max-height: 48mm; overflow: hidden; font-size: 6.5pt; line-height: 1.35; }
    .git-evidence { margin: 0; padding: 0.5rem 0.65rem; background: #0d1117; color: #c9d1d9; font-family: Consolas, monospace; font-size: 7pt; line-height: 1.45; white-space: pre-wrap; border-top: 1px solid var(--rev-border); }
    .fig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; }
    @media screen {
      .page { min-height: var(--a4-h); height: auto; max-height: none; overflow: visible; }
      .sheet-main { overflow: visible; }
    }
    @media print {
      .page { width: 210mm; min-height: 297mm; height: auto; max-height: none; margin: 0; box-shadow: none; border: none; overflow: visible; }
      .sheet-main { overflow: visible; }
      .no-print { display: none !important; }
      .fig-real, table, pre, .mermaid, .exec-box { break-inside: avoid; }
      @page { size: 210mm 297mm; margin: 15mm 18mm; }
    }
  </style>
</head>
<body class="informe-rev">
`;

const pageCount = (cover.match(/section/g) || []).length + (body.match(/<section class="page/g) || []).length;
const tail = `
<p class="no-print footer-note" style="width:210mm;max-width:calc(100% - 2rem);margin:12mm auto 2rem;padding:1rem;text-align:center;background:#fff;border:1px solid var(--rev-border-strong);border-radius:8px;">
  <strong>${pageCount} hojas A4</strong> — tema claro · evidencias del repositorio · v1.4<br/>
  PDF: <kbd>Ctrl+P</kbd> → A4 → vertical → Gráficos de fondo ON → escala 100%
</p>
</body></html>`;

fs.writeFileSync(htmlPath, head + cover + '\n\n' + body + tail);
console.log('Informe v1.4 generado:', pageCount, 'hojas');
