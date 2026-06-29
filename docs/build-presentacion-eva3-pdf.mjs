/**
 * Genera Presentacion-REV-EVA3.pdf en informe-evidencias/eva3/
 * CSS inlined — Marp PDF no resuelve @import.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_MD = path.join(__dirname, 'presentacion-rev-eva3-build.md');
const THEME_CSS = path.join(__dirname, 'presentacion-rev-theme.css');
const ICONS_CSS = path.join(__dirname, 'presentacion-rev-icons.css');
const EVA3_DIR = path.join(__dirname, 'informe-evidencias', 'eva3');
const OUT_PDF = path.join(EVA3_DIR, 'Presentacion-REV-EVA3.pdf');

const PDF_OVERRIDES = `
/* Ajustes PDF EVA3 — proporción y legibilidad */
section {
  font-size: 19px !important;
  padding: 24px 36px 32px !important;
}

section h1 {
  font-size: 1.05em !important;
  margin-bottom: 0.35em !important;
}

section.dense h1 { font-size: 0.98em !important; }

section .rev-sub {
  font-size: 0.55em !important;
  margin-bottom: 0.45em !important;
}

section .rev-sub .rev-ico { display: none !important; }
section .rev-sub::before { display: block !important; }

section .slide-workspace {
  gap: 6px !important;
  max-height: calc(100% - 52px);
}

.rev-value-layout {
  gap: 10px !important;
  grid-template-columns: 30% 1fr !important;
}

.rev-value-aside {
  padding: 10px 8px !important;
}

.rev-value-aside__logo {
  height: 52px !important;
}

.rev-value-aside__pitch p {
  font-size: 0.5em !important;
  line-height: 1.38 !important;
}

.rev-value-grid {
  gap: 5px !important;
}

section.slide-value-premium .rev-kpi {
  padding: 5px 7px !important;
}

section.slide-value-premium .rev-kpi__value {
  font-size: 0.5em !important;
}

section.slide-value-premium .rev-kpi__meta {
  font-size: 0.42em !important;
}

section.slide-patterns-validated .slide-workspace {
  gap: 4px !important;
}

section.slide-patterns-validated .rev-pattern-row {
  min-height: 30px !important;
  padding: 4px 8px !important;
}

section.slide-patterns-validated .rev-pattern-row__icon {
  display: none !important;
}

.rev-diagram-img img,
.rev-diagram-img svg {
  max-height: 200px !important;
}

section.diagram-top .rev-diagram-img img,
section.diagram-top .rev-diagram-img svg {
  max-height: 240px !important;
}

.rev-panel table {
  font-size: 0.48em !important;
}

.rev-kpi, .rev-ms-card, .rev-card {
  padding: 6px 8px !important;
}

.rev-callout {
  font-size: 0.56em !important;
  padding: 6px 9px !important;
}

section footer {
  font-size: 0.38em !important;
}
`;

function readInlinedCss() {
  const icons = fs.readFileSync(ICONS_CSS, 'utf8');
  let theme = fs.readFileSync(THEME_CSS, 'utf8');
  theme = theme.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);?\s*/g, '');
  theme = theme.replace(/@import url\('presentacion-rev-icons\.css'\);?/g, icons);
  return `${theme}\n${PDF_OVERRIDES}`;
}

function prepareBuildMd() {
  let md = fs.readFileSync(BUILD_MD, 'utf8');
  const extra = `
pre[is='marp-pre'], pre[data-auto-scaling], code.language-mermaid {
  background: #07111f !important;
  color: #a7b4c7 !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 12px !important;
}`;
  const css = `${readInlinedCss()}\n${extra}`;
  const indented = css.split('\n').map((line) => `  ${line}`).join('\n');
  md = md.replace(/style:\s*\|\s*\n[\s\S]*?(?=\n---)/, `style: |\n${indented}\n`);
  const pdfMd = path.join(__dirname, 'presentacion-rev-eva3-pdf-build.md');
  fs.writeFileSync(pdfMd, md, 'utf8');
  return pdfMd;
}

if (!fs.existsSync(EVA3_DIR)) {
  fs.mkdirSync(EVA3_DIR, { recursive: true });
}

console.log('1/4 Sincronizando iconos EVA3…');
execSync('node sync-eva3-icons.mjs', { cwd: __dirname, stdio: 'inherit' });

console.log('2/4 Sincronizando imágenes…');
execSync('node sync-presentacion-images.mjs', { cwd: __dirname, stdio: 'inherit' });

console.log('3/4 Preprocesando diagramas…');
execSync('node preprocess-mermaid-presentacion.mjs', { cwd: __dirname, stdio: 'inherit' });

console.log('4/4 Generando PDF EVA3…');
const pdfMd = prepareBuildMd();
execSync(
  `npx --yes @marp-team/marp-cli@4.1.2 --no-stdin "${pdfMd}" -o "${OUT_PDF}" --allow-local-files`,
  { cwd: __dirname, stdio: 'inherit' },
);

const sizeMb = (fs.statSync(OUT_PDF).size / (1024 * 1024)).toFixed(2);
console.log(`\nListo: ${OUT_PDF} (${sizeMb} MB)`);
