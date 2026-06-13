/**
 * Genera Presentacion-REV-EVA2-v5.html desde Marp con tema REV inlined.
 * Requiere: diagramas SVG (preprocess) y capturas en informe-evidencias/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_MD = path.join(__dirname, 'presentacion-rev-build.md');
const THEME_CSS = path.join(__dirname, 'presentacion-rev-theme.css');
const OUT_HTML = path.join(__dirname, 'Presentacion-REV-EVA2-v5.html');

const PORTADA_PNG = path.join(__dirname, 'presentacion-assets', 'portada-rev.png');

const REQUIRED_IMAGES = [
  'presentacion-assets/portada-rev.png',
  'presentacion-assets/emblem-rev.svg',
  'presentacion-assets/emblem-light.png',
  'images/rev-about-dispatch.png',
  'images/rev-about-map.png',
  'images/rev-field-team.png',
  'images/rev-device.png',
  'images/rev-imag-05.png',
  'images/rev-imag-06.png',
  'images/rev-about-portal.png',
  'images/rev-closing-hero.png',
  'images/rev-slide-portal.png',
  'images/rev-slide-persist.png',
  'images/rev-slide-git.png',
  'images/rev-slide-roadmap.png',
];

function assertAssets() {
  const missing = REQUIRED_IMAGES.filter((rel) => !fs.existsSync(path.join(__dirname, rel)));
  if (missing.length) {
    console.error('Faltan assets para la presentación HTML:');
    for (const m of missing) console.error(`  - ${m}`);
    if (missing.some((m) => m.startsWith('images/'))) {
      console.error('Ejecute: node sync-presentacion-images.mjs');
    }
    process.exit(1);
  }
}

function inlineThemeCss(html) {
  const theme = fs.readFileSync(THEME_CSS, 'utf8');
  return html.replace(/@import url\(['"]presentacion-rev-theme\.css['"]\);?/g, theme);
}

function inlineDiagramSvgs(html) {
  const embedSvg = (fname) => {
    const svgPath = path.join(__dirname, 'presentacion-diagramas', fname);
    if (!fs.existsSync(svgPath)) return null;
    let svg = fs.readFileSync(svgPath, 'utf8');
    svg = svg.replace(/<svg /, '<svg style="max-width:100%;height:auto;display:block;margin:0 auto;" ');
    return `<div class="rev-diagram-img rev-diagram-img--inline">${svg}</div>`;
  };

  let out = html.replace(
    /<div class="rev-diagram-img"><img src="presentacion-diagramas\/(diag-\d+)\.(?:png|svg)" alt="[^"]*"\s*\/?>\s*<\/div>/g,
    (_match, id) => embedSvg(`${id}.svg`) ?? _match,
  );

  out = out.replace(
    /<div class="rev-diagram-img"><img src="data:image\/svg\+xml;base64,[^"]*"[^>]*>\s*<\/div>/g,
    (_match) => {
      const m = _match.match(/diag-(\d+)\.svg/);
      if (m) return embedSvg(`diag-${m[1]}.svg`) ?? _match;
      return _match;
    },
  );

  return out;
}

if (!fs.existsSync(PORTADA_PNG)) {
  console.log('0/4 Extrayendo portada oficial desde PDF…');
  try {
    execSync('node extract-portada-png.mjs', { cwd: __dirname, stdio: 'inherit' });
  } catch {
    console.warn('No se pudo generar portada-rev.png; coloque el PDF en Downloads o en presentacion-assets/.');
  }
}

console.log('1/5 Sincronizando imágenes institucionales…');
execSync('node sync-presentacion-images.mjs', { cwd: __dirname, stdio: 'inherit' });

console.log('2/5 Preprocesando diagramas Mermaid…');
execSync('node preprocess-mermaid-presentacion.mjs', { cwd: __dirname, stdio: 'inherit' });

assertAssets();

console.log('3/5 Generando HTML con Marp…');
execSync(
  `npx --yes @marp-team/marp-cli@4.1.2 --no-stdin "${BUILD_MD}" -o "${OUT_HTML}" --allow-local-files --html`,
  { cwd: __dirname, stdio: 'inherit' },
);

console.log('4/5 Inlining tema REV y diagramas…');
let html = inlineThemeCss(fs.readFileSync(OUT_HTML, 'utf8'));
html = html.replace(/@import url\(['"]presentacion-rev-icons\.css['"]\);?/g, fs.readFileSync(path.join(__dirname, 'presentacion-rev-icons.css'), 'utf8'));
html = inlineDiagramSvgs(html);
fs.writeFileSync(OUT_HTML, html, 'utf8');

const sizeMb = (fs.statSync(OUT_HTML).size / (1024 * 1024)).toFixed(2);
console.log(`\nListo: ${path.basename(OUT_HTML)} (${sizeMb} MB)`);
console.log('Abrir en navegador: file:///' + OUT_HTML.replace(/\\/g, '/'));
console.log('Controles: ← → · F pantalla completa · P vista presentador');
