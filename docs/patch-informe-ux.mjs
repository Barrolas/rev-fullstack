import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'informe-tecnico-integral-rev.html');
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'informe-tecnico-integral-rev.patched.html');
let html = fs.readFileSync(file, 'utf8');

html = html.replace(
  /\.fig-img \{ display: block; width: 100%; max-height: 55mm; object-fit: cover; object-position: top; border-top: 1px solid var\(--rev-border\); border-bottom: 1px solid var\(--rev-border\); \}/,
  `.fig-img { display: block; width: 100%; max-height: 55mm; object-fit: cover; object-position: top; border-top: 1px solid var(--rev-border); border-bottom: 1px solid var(--rev-border); }
    .fig-img--app { object-fit: contain; max-height: 62mm; background: #0a1628; padding: 0.15rem; }
    .fig-real--wide { grid-column: 1 / -1; }`,
);

const cap12block = `<figure class="fig-real">
  <p class="fig-num">Figura 14</p>
  <p class="fig-title">Dashboard Despacho — panel operacional</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig14-dispatch.png" alt="Dashboard Despacho REV" loading="lazy" />
  <p class="fig-desc">Captura real de <code>/</code> con sesión despachador: KPIs, incidente activo y módulos Zonas/Recursos.</p>
</figure>
  <figure class="fig-real">
  <p class="fig-num">Figura 15</p>
  <p class="fig-title">Módulo Incidentes — listado y correlaciones</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig15-incidentes.png" alt="Módulo Incidentes REV" loading="lazy" />
  <p class="fig-desc">Captura real de <code>/incidentes</code>: filtros, vista listado y panel de distribución.</p>
</figure>
  <figure class="fig-real">
  <p class="fig-num">Figura 16</p>
  <p class="fig-title">Login — pestaña Reportar emergencia</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig16-login-reporte.png" alt="Login REV — reporte público" loading="lazy" />
  <p class="fig-desc">Captura real de <code>/login</code>: formulario por pasos, mapa OSM y guía ciudadana.</p>
</figure>`;

html = html.replace(
  /<figure class="fig-real">\s*<p class="fig-num">Figura 14<\/p>[\s\S]*?<p class="fig-desc">Pantalla de acceso con canal ciudadano — <code>login-hero\.jpg<\/code>\.<\/p>\s*<\/figure>/,
  cap12block,
);

const cap13block = `<h3>Capturas UX (figuras 14–16b)</h3>
  <p>Pantallas capturadas del dashboard REV (<code>frontend/rev-dashboard</code>) con datos reales del stack Docker local.</p>
  <div class="fig-grid">
    <figure class="fig-real">
  <p class="fig-num">Figura 14</p>
  <p class="fig-title">Despacho — centro de operaciones</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig14-dispatch.png" alt="Despacho REV" loading="lazy" />
  <p class="fig-desc">Ruta <code>/</code> · monitoreo operacional.</p>
</figure>
    <figure class="fig-real">
  <p class="fig-num">Figura 15</p>
  <p class="fig-title">Incidentes — seguimiento</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig15-incidentes.png" alt="Incidentes REV" loading="lazy" />
  <p class="fig-desc">Ruta <code>/incidentes</code> · listado y filtros.</p>
</figure>
    <figure class="fig-real">
  <p class="fig-num">Figura 15b</p>
  <p class="fig-title">Zonas de riesgo — mapa Leaflet</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig15b-zonas.png" alt="Zonas REV" loading="lazy" />
  <p class="fig-desc">Ruta <code>/zonas</code> · mapa territorial.</p>
</figure>
    <figure class="fig-real">
  <p class="fig-num">Figura 16</p>
  <p class="fig-title">Login — reporte ciudadano</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig16-login-reporte.png" alt="Login reporte REV" loading="lazy" />
  <p class="fig-desc">Ruta <code>/login</code> · pestaña Reportar.</p>
</figure>
    <figure class="fig-real fig-real--wide">
  <p class="fig-num">Figura 16b</p>
  <p class="fig-title">Portal ciudadano</p>
  <img class="fig-img fig-img--app" src="informe-evidencias/fig16b-portal.png" alt="Portal REV" loading="lazy" />
  <p class="fig-desc">Ruta <code>/portal</code> · landing pública.</p>
</figure>
  </div>`;

html = html.replace(
  /<h3>Capturas UX \(figuras 14–16\)<\/h3>\s*<div class="fig-grid">[\s\S]*?<\/div>\s*<\/div>\s*<footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV<\/span><span class="sheet-foot__num"><\/span><\/footer>\s*<\/section>\s*\n<section class="page page-break" id="cap13-2">/,
  `${cap13block}
  </div>
  <footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV</span><span class="sheet-foot__num"></span></footer>
</section>

<section class="page page-break" id="cap13-2">`,
);

html = html.replace(
  /informe-evidencias\/fig15-zonas\.png/g,
  'informe-evidencias/fig15-incidentes.png',
);

fs.writeFileSync(out, html);
console.log('Informe UX actualizado');
