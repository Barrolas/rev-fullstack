/**
 * Genera Presentacion-REV-EVA3.html — tema REV + premium + splash + iconos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_MD = path.join(__dirname, 'presentacion-rev-eva3-build.md');
const THEME_CSS = path.join(__dirname, 'presentacion-rev-theme.css');
const ICONS_CSS = path.join(__dirname, 'presentacion-rev-icons.css');
const PREMIUM_CSS = path.join(__dirname, 'presentacion-rev-premium.css');
const SPLASH_CSS = path.join(__dirname, 'presentacion-rev-splash.css');
const EMBLEM_PNG = path.join(__dirname, 'presentacion-assets', 'emblem-light.png');
const EVA3_DIR = path.join(__dirname, 'informe-evidencias', 'eva3');
const OUT_HTML = path.join(EVA3_DIR, 'Presentacion-REV-EVA3.html');

const PORTADA_PNG = path.join(__dirname, 'presentacion-assets', 'portada-rev.png');

const REQUIRED_IMAGES = [
  'presentacion-assets/portada-rev.png',
  'presentacion-assets/emblem-rev.svg',
  'presentacion-assets/emblem-light.png',
  'images/rev-about-dispatch.png',
  'images/rev-about-map.png',
  'images/rev-imag-06.png',
  'images/rev-closing-hero.png',
  'images/rev-slide-portal.png',
  'images/rev-slide-persist.png',
  'images/rev-slide-git.png',
  'images/rev-slide-roadmap.png',
  'informe-evidencias/fig14-dispatch.png',
  'informe-evidencias/fig15-incidentes.png',
  'informe-evidencias/fig15b-zonas.png',
];

function assertAssets() {
  const missing = REQUIRED_IMAGES.filter((rel) => !fs.existsSync(path.join(__dirname, rel)));
  if (missing.length) {
    console.error('Faltan assets para la presentación EVA3 HTML:');
    for (const m of missing) console.error(`  - ${m}`);
    if (missing.some((m) => m.startsWith('images/'))) {
      console.error('Ejecute: node sync-presentacion-images.mjs');
    }
    process.exit(1);
  }
}

function inlineThemeCss(html) {
  const theme = fs.readFileSync(THEME_CSS, 'utf8');
  let out = html.replace(/@import url\(['"]presentacion-rev-theme\.css['"]\);?/g, theme);
  out = out.replace(/@import url\(['"]presentacion-rev-icons\.css['"]\);?/g, fs.readFileSync(ICONS_CSS, 'utf8'));
  // Premium solo en <head> — no inline en data-style (selectores con "" rompen atributos HTML)
  out = out.replace(/@import url\(['"]presentacion-rev-premium\.css['"]\);?\s*/g, '');
  return out;
}

function injectPremiumAndSplash(html) {
  const premium = fs.readFileSync(PREMIUM_CSS, 'utf8');
  const splashCss = fs.readFileSync(SPLASH_CSS, 'utf8');
  const splashHtml = `
<div id="rev-splash" class="rev-splash" role="status" aria-live="polite" aria-label="Cargando presentación REV">
  <div class="rev-splash__canvas" aria-hidden="true">
    <div class="rev-splash__layer rev-splash__layer--base"></div>
    <div class="rev-splash__layer rev-splash__layer--grid"></div>
    <div class="rev-splash__layer rev-splash__layer--topo"></div>
    <div class="rev-splash__layer rev-splash__layer--radar">
      <svg class="rev-splash__radar-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(249,115,22,0.08)" stroke-width="0.75"/>
        <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
        <circle cx="100" cy="100" r="36" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="0.5"/>
        <line x1="100" y1="12" x2="100" y2="188" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>
        <line x1="12" y1="100" x2="188" y2="100" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>
        <path d="M100 100 L100 12 A88 88 0 0 1 188 100 Z" fill="url(#rev-splash-radar-sweep)" class="rev-splash__radar-sweep"/>
        <defs>
          <radialGradient id="rev-splash-radar-sweep" cx="100" cy="100" r="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="rgba(249,115,22,0.12)"/>
            <stop offset="100%" stop-color="rgba(249,115,22,0)"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <div class="rev-splash__layer rev-splash__layer--pins">
      <span class="rev-splash__pin rev-splash__pin--1"></span>
      <span class="rev-splash__pin rev-splash__pin--2"></span>
      <span class="rev-splash__pin rev-splash__pin--3"></span>
      <span class="rev-splash__pin rev-splash__pin--4"></span>
    </div>
    <div class="rev-splash__layer rev-splash__layer--coords">
      <span class="rev-splash__coord rev-splash__coord--tl">33.50° S · 70.50° W</span>
      <span class="rev-splash__coord rev-splash__coord--tr">GRID REF · MUN-REV</span>
      <span class="rev-splash__coord rev-splash__coord--br">VALLE DEL SOL · OPS</span>
    </div>
    <div class="rev-splash__fade"></div>
  </div>
  <div class="rev-splash__content">
    <img class="rev-splash__logo" src="../../presentacion-assets/emblem-light.png" alt="Logo REV" width="200" height="200" />
    <div class="rev-splash__accent" aria-hidden="true"></div>
    <h1 class="rev-splash__brand">Red de Emergencia <em>Valle</em></h1>
    <p class="rev-splash__tagline">Conectividad que salva vidas</p>
  </div>
  <div class="rev-splash__track" aria-hidden="true"><div class="rev-splash__track-fill"></div></div>
</div>`;

  const splashScript = `
<script id="rev-splash-script">
(function () {
  var body = document.body;
  var splash = document.getElementById('rev-splash');
  if (!splash || !body) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var duration = reduced ? 800 : 3000;
  body.classList.add('rev-splash-active');

  function goToCover() {
    var base = location.href.split('#')[0];
    if (location.hash !== '#1') {
      history.replaceState(null, '', base + '#1');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }

  function dismiss() {
    if (!splash) return;
    splash.classList.add('is-hiding');
    body.classList.remove('rev-splash-active');
    body.classList.add('rev-splash-done');
    goToCover();
    setTimeout(function () {
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      var s = document.getElementById('rev-splash-script');
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }, reduced ? 200 : 680);
  }

  if (document.readyState === 'complete') {
    setTimeout(dismiss, duration);
  } else {
    window.addEventListener('load', function () { setTimeout(dismiss, duration); });
  }
  splash.addEventListener('click', dismiss);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') dismiss();
  }, { once: true });
})();
</script>`;

  let out = html.replace('</head>', `<style id="rev-premium-css">\n${premium}\n${splashCss}\n</style></head>`);
  out = out.replace('<body>', `<body class="rev-splash-active">${splashHtml}`);
  out = out.replace('</body>', `${splashScript}</body>`);
  return out;
}

function inlineDiagramSvgs(html) {
  const embedSvg = (fname) => {
    const svgPath = path.join(__dirname, 'presentacion-diagramas', fname);
    if (!fs.existsSync(svgPath)) return null;
    let svg = fs.readFileSync(svgPath, 'utf8');
    svg = svg.replace(/<svg /, '<svg style="max-width:100%;height:auto;display:block;margin:0 auto;" ');
    return `<div class="rev-diagram-img rev-diagram-img--inline">${svg}</div>`;
  };

  return html.replace(
    /<div class="rev-diagram-img"><img src="presentacion-diagramas\/(diag-\d+)\.(?:png|svg)" alt="[^"]*"\s*\/?>\s*<\/div>/g,
    (_match, id) => embedSvg(`${id}.svg`) ?? _match,
  );
}

function rewriteAssetPaths(html) {
  return html
    .replace(/presentacion-assets\//g, '../../presentacion-assets/')
    .replace(/presentacion-diagramas\//g, '../../presentacion-diagramas/')
    .replace(/(?<![./])images\//g, '../../images/')
    .replace(/informe-evidencias\//g, '../');
}

if (!fs.existsSync(EVA3_DIR)) {
  fs.mkdirSync(EVA3_DIR, { recursive: true });
}

if (!fs.existsSync(BUILD_MD)) {
  console.error(`No existe ${BUILD_MD}`);
  process.exit(1);
}

console.log('0/5 Sincronizando iconos en slides EVA3…');
execSync('node sync-eva3-icons.mjs', { cwd: __dirname, stdio: 'inherit' });

if (!fs.existsSync(PORTADA_PNG)) {
  console.log('Extrayendo portada…');
  try {
    execSync('node extract-portada-png.mjs', { cwd: __dirname, stdio: 'inherit' });
  } catch {
    console.warn('No se pudo generar portada-rev.png');
  }
}

console.log('1/5 Sincronizando imágenes…');
execSync('node sync-presentacion-images.mjs', { cwd: __dirname, stdio: 'inherit' });

assertAssets();

console.log('2/5 Generando HTML con Marp…');
execSync(
  `npx --yes @marp-team/marp-cli@4.1.2 --no-stdin "${BUILD_MD}" -o "${OUT_HTML}" --allow-local-files --html`,
  { cwd: __dirname, stdio: 'inherit' },
);

console.log('3/5 Inlining tema REV y diagramas…');
let html = inlineThemeCss(fs.readFileSync(OUT_HTML, 'utf8'));
html = inlineDiagramSvgs(html);

console.log('4/5 Aplicando capa premium + splash…');
html = injectPremiumAndSplash(html);
html = rewriteAssetPaths(html);

fs.writeFileSync(OUT_HTML, html, 'utf8');

const legacyHtml = path.join(__dirname, 'Presentacion-REV-EVA3.html');
if (fs.existsSync(legacyHtml)) fs.unlinkSync(legacyHtml);

const sizeMb = (fs.statSync(OUT_HTML).size / (1024 * 1024)).toFixed(2);
console.log(`\nListo: ${path.basename(OUT_HTML)} (${sizeMb} MB)`);
console.log('Abrir: file:///' + OUT_HTML.replace(/\\/g, '/'));
