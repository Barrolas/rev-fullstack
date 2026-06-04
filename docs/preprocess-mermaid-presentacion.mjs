/**
 * Preprocesa presentacion-rev-final.md: convierte bloques ```mermaid en SVG
 * (Marp CLI no renderiza Mermaid en PDF de forma nativa).
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

fs.mkdirSync(DIAG_DIR, { recursive: true });

let md = fs.readFileSync(SRC, 'utf8');
let count = 0;
let failed = 0;

md = md.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_match, body) => {
  count += 1;
  const id = String(count).padStart(2, '0');
  const mmdPath = path.join(DIAG_DIR, `diag-${id}.mmd`);
  const svgPath = path.join(DIAG_DIR, `diag-${id}.svg`);
  fs.writeFileSync(mmdPath, `${body.trim()}\n`, 'utf8');

  try {
    execSync(
      `npx --yes @mermaid-js/mermaid-cli@11.4.0 -i "${mmdPath}" -o "${svgPath}" -b transparent -c "${CONFIG}"`,
      { stdio: 'pipe', cwd: __dirname }
    );
    const rel = `presentacion-diagramas/diag-${id}.svg`;
    return `\n<div class="rev-diagram-img"><img src="${rel}" alt="Diagrama REV ${id}" /></div>\n`;
  } catch (err) {
    failed += 1;
    console.error(`[WARN] diag-${id} no generado:`, err.stderr?.toString?.() || err.message);
    return `\n<div class="rev-diagram-img rev-diagram-img--error">Diagrama ${id} — error de render</div>\n`;
  }
});

fs.writeFileSync(OUT, md, 'utf8');
console.log(`Mermaid → SVG: ${count - failed}/${count} OK · salida: ${path.basename(OUT)}`);
