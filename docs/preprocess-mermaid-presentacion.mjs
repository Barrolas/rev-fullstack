/**
 * Preprocesa presentacion-rev-final.md:
 * - Mermaid → PNG (PDF-safe; SVG con foreignObject falla en <img>)
 * - Conserva SVG para inlining en HTML
 * - Elimina <svg> inline (Marp PDF los muestra como texto)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'presentacion-rev-final.md');
const OUT = path.join(__dirname, 'presentacion-rev-build.md');
const DIAG_DIR = path.join(__dirname, 'presentacion-diagramas');
const CONFIG = path.join(__dirname, 'mermaid-rev-config.json');
const MERMAID = '@mermaid-js/mermaid-cli@11.4.0';

fs.mkdirSync(DIAG_DIR, { recursive: true });

let md = fs.readFileSync(SRC, 'utf8');
let count = 0;
let failed = 0;

md = md.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_match, body) => {
  count += 1;
  const id = String(count).padStart(2, '0');
  const mmdPath = path.join(DIAG_DIR, `diag-${id}.mmd`);
  const svgPath = path.join(DIAG_DIR, `diag-${id}.svg`);
  const pngPath = path.join(DIAG_DIR, `diag-${id}.png`);
  fs.writeFileSync(mmdPath, `${body.trim()}\n`, 'utf8');

  try {
    execSync(
      `npx --yes ${MERMAID} -i "${mmdPath}" -o "${svgPath}" -b transparent -c "${CONFIG}"`,
      { stdio: 'pipe', cwd: __dirname },
    );
    let svg = fs.readFileSync(svgPath, 'utf8');
    svg = svg.replace(/<svg /, '<svg class="rev-mermaid-svg" ');
    svg = svg.replace(/stroke-width="1"/g, 'stroke-width="1.35"');
    fs.writeFileSync(svgPath, svg, 'utf8');

    execSync(
      `npx --yes ${MERMAID} -i "${mmdPath}" -o "${pngPath}" -b transparent -c "${CONFIG}" -w 1280 -s 2`,
      { stdio: 'pipe', cwd: __dirname },
    );

    const rel = `presentacion-diagramas/diag-${id}.png`;
    return `\n<div class="rev-diagram-img"><img src="${rel}" alt="Diagrama REV ${id}" /></div>\n`;
  } catch (err) {
    failed += 1;
    console.error(`[WARN] diag-${id} no generado:`, err.stderr?.toString?.() || err.message);
    return `\n<div class="rev-diagram-img rev-diagram-img--error">Diagrama ${id} — error de render</div>\n`;
  }
});

md = md.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
md = md.replace(/<div class="rev-ms-card__icon">\s*<\/div>/g, '<div class="rev-ms-card__icon"></div>');
md = md.replace(/<div class="rev-kpi__glyph[^"]*">\s*<\/div>/g, (m) => m.replace(/\s*<\/div>/, '></div>').replace(/>\s*</, '><'));
md = md.replace(/<div class="rev-kpi__glyph([^"]*)">\s*<\/div>/g, '<div class="rev-kpi__glyph$1"></div>');

fs.writeFileSync(OUT, md, 'utf8');
console.log(`Mermaid → PNG: ${count - failed}/${count} OK · SVG inline removidos · salida: ${path.basename(OUT)}`);
