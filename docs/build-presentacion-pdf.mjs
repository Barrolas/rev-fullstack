/**
 * Genera Presentacion-REV-EVA2-v5.pdf con CSS inlined (Marp PDF no resuelve @import).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_MD = path.join(__dirname, 'presentacion-rev-build.md');
const THEME_CSS = path.join(__dirname, 'presentacion-rev-theme.css');
const ICONS_CSS = path.join(__dirname, 'presentacion-rev-icons.css');
const OUT_PDF = path.join(__dirname, 'Presentacion-REV-EVA2-v5.pdf');

function readInlinedCss() {
  const icons = fs.readFileSync(ICONS_CSS, 'utf8');
  let theme = fs.readFileSync(THEME_CSS, 'utf8');
  theme = theme.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);?\s*/g, '');
  theme = theme.replace(/@import url\('presentacion-rev-icons\.css'\);?/g, icons);
  return theme;
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
  const pdfMd = path.join(__dirname, 'presentacion-rev-pdf-build.md');
  fs.writeFileSync(pdfMd, md, 'utf8');
  return pdfMd;
}

console.log('1/4 Sincronizando imágenes…');
execSync('node sync-presentacion-images.mjs', { cwd: __dirname, stdio: 'inherit' });

console.log('2/4 Preprocesando diagramas (PNG + sin SVG inline)…');
execSync('node preprocess-mermaid-presentacion.mjs', { cwd: __dirname, stdio: 'inherit' });

console.log('3/4 Inlining CSS para export PDF…');
const pdfMd = prepareBuildMd();

console.log('4/4 Generando PDF…');
execSync(
  `npx --yes @marp-team/marp-cli@4.1.2 --no-stdin "${pdfMd}" -o "${OUT_PDF}" --allow-local-files`,
  { cwd: __dirname, stdio: 'inherit' },
);

const sizeMb = (fs.statSync(OUT_PDF).size / (1024 * 1024)).toFixed(2);
console.log(`\nListo: ${path.basename(OUT_PDF)} (${sizeMb} MB)`);
