/**
 * Copia rev-sub con iconos SVG desde presentacion-rev-final.md → eva3-build/final
 * Empareja slides por título H1 (# ...).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'presentacion-rev-final.md');
const TARGETS = [
  path.join(__dirname, 'presentacion-rev-eva3-build.md'),
  path.join(__dirname, 'presentacion-rev-eva3-final.md'),
];

function extractSubByTitle(md) {
  const map = new Map();
  const parts = md.split(/^# /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    if (nl === -1) continue;
    const title = part.slice(0, nl).trim();
    const m = part.match(/<h2 class="rev-sub">[\s\S]*?<\/h2>/);
    if (m) map.set(title, m[0]);
  }
  return map;
}

function extractKpiDeck(md, title) {
  const re = new RegExp(
    `# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?<div class="rev-deck rev-deck--3">([\\s\\S]*?)<\\/div>`,
  );
  const m = md.match(re);
  return m ? m[1] : null;
}

function applyIcons(targetPath, subMap, kpiMap) {
  let md = fs.readFileSync(targetPath, 'utf8');
  let subs = 0;
  let kpis = 0;

  for (const [title, subHtml] of subMap) {
    const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      `(# ${esc}[\\s\\S]*?)<h2 class="rev-sub"><span>([\\s\\S]*?)<\\/span><\\/h2>`,
    );
    if (re.test(md)) {
      md = md.replace(re, `$1${subHtml}`);
      subs += 1;
    }
  }

  // Slide valor operacional: layout custom EVA3 — no sobrescribir KPIs desde final.md
  void kpiMap;

  fs.writeFileSync(targetPath, md, 'utf8');
  return { subs, kpis };
}

const srcMd = fs.readFileSync(SRC, 'utf8');
const subMap = extractSubByTitle(srcMd);
const kpiDeck = extractKpiDeck(srcMd, 'Plataforma REV — valor operacional');
const kpiMap = new Map();
if (kpiDeck) kpiMap.set('Plataforma REV — valor operacional', kpiDeck);

for (const t of TARGETS) {
  if (!fs.existsSync(t)) continue;
  const r = applyIcons(t, subMap, kpiMap);
  console.log(`${path.basename(t)}: ${r.subs} subtítulos · ${r.kpis} KPI deck`);
}

// Iconos EVA3-only (slides sin equivalente en final)
const eva3Subs = {
  'Estrategia de calidad y pruebas':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M6 7l2 2 3-4"/></svg><span>Tres capas de validación en flujos críticos</span></h2>',
  'Áreas críticas bajo prueba':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 1.5 14 4v4c0 3.5-2.5 6-6 6.5C4.5 14 2 11.5 2 8V4l6-2.5Z"/><path d="M8 5v3M8 11h.01"/></svg><span>Riesgos operacionales que la suite protege</span></h2>',
  'Matriz de pruebas — flujos críticos':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 3h12v10H2z"/><path d="M5 7h6M5 10h3"/></svg><span>Casos representativos trazados PASS</span></h2>',
  'Resultados de ejecución automatizada':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 3h10v10H3z"/><path d="M6 7l2 2 3-4"/></svg><span>Suite Maven — cero fallos en módulos críticos</span></h2>',
  'Cobertura JaCoCo por módulo':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 12 5 7l3 3 3-5 3 7"/><path d="M2 14h12"/></svg><span>Métricas de instrucciones — segunda pasada v2</span></h2>',
  'Patrones validados por la suite':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M4 3h8v3H4z"/><path d="M3 9h10v4H3z"/><path d="M6 6v3"/></svg><span>Diseño probado — no solo documentado</span></h2>',
  'Bugs detectados y correcciones':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/><circle cx="8" cy="8" r="6"/></svg><span>Pruebas que mejoraron el software</span></h2>',
  'Pruebas end-to-end':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M2 8h3M11 8h3"/><path d="M5 6l3 2-3 2M11 6l-3 2 3 2"/></svg><span>Validación de punta a punta — operador y ciudadano</span></h2>',
  'Entregables del producto':
    '<h2 class="rev-sub"><svg class="rev-ico" viewBox="0 0 16 16"><path d="M3 2h7l3 3v9H3z"/><path d="M10 2v3h3"/></svg><span>Arquitectura, código y evidencia de calidad</span></h2>',
};

for (const t of TARGETS) {
  if (!fs.existsSync(t)) continue;
  applyIcons(t, new Map(Object.entries(eva3Subs)), new Map());
}
