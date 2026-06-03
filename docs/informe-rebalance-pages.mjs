/**
 * Rebalancea hojas A4 del informe: fusiona páginas con exceso de blanco
 * y reparte solo donde el contenido lo exige (diagramas, capítulos densos).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'informe-tecnico-integral-rev.html');
let html = fs.readFileSync(filePath, 'utf8');

function foot() {
  return `  <footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV</span><span class="sheet-foot__num"></span></footer>\n</section>`;
}

function wrapPage(id, headTitle, inner, extraClass = '') {
  const cls = extraClass ? ` page ${extraClass}` : ' page';
  return `<section class="${cls.trim()} page-break" id="${id}">
  <header class="sheet-head"><span class="sheet-head__brand">REV · Informe Técnico</span><span class="sheet-head__title">${headTitle}</span></header>
  <div class="sheet-main">
${inner.trim()}
  </div>
${foot()}`;
}

const start = html.indexOf('<section class="page page-break" id="resumen">');
if (start < 0) throw new Error('No se encontró la sección resumen');
const end = html.indexOf('<p class="no-print footer-note"');
const body = html.slice(start, end);

const sectionRe = /<section class="page[^"]*" id="([^"]+)">[\s\S]*?<div class="sheet-main">\s*([\s\S]*?)\s*<\/div>\s*<footer class="sheet-foot">/g;
const pages = new Map();
let m;
while ((m = sectionRe.exec(body)) !== null) {
  pages.set(m[1], m[2].trim());
}

function chapterContent(ids) {
  return ids.map((id) => pages.get(id)).filter(Boolean).join('\n\n');
}

/** @type {{ id: string, title: string, inner: string, tight?: boolean }[]} */
const layout = [
  {
    id: 'resumen',
    title: 'Resumen ejecutivo',
    inner: chapterContent(['resumen', 'resumen-2']).replace(
      /<h1>Resumen ejecutivo<\/h1>\s*/,
      '<h1>Resumen ejecutivo</h1>\n',
    ),
  },
  { id: 'indice', title: 'Tabla de contenidos', inner: pages.get('indice') },
  {
    id: 'cap1',
    title: 'Cap. 1 — Introducción',
    inner: chapterContent(['cap1', 'cap1-2']).replace(
      /<h1>1\. Introducción<\/h1>\s*/,
      '<h1>1. Introducción</h1>\n',
    ),
  },
  {
    id: 'cap2',
    title: 'Cap. 2 — Descripción general',
    inner: chapterContent(['cap2', 'cap2-2']),
  },
  { id: 'cap3', title: 'Cap. 3 — Arquitectura (1/2)', inner: pages.get('cap3') },
  {
    id: 'cap3-2',
    title: 'Cap. 3 — Arquitectura (2/2)',
    inner: chapterContent(['cap3-2', 'cap3-3', 'cap3-4']),
  },
  { id: 'cap4', title: 'Cap. 4 — Arquetipos (1/2)', inner: pages.get('cap4') },
  { id: 'cap4-2', title: 'Cap. 4 — Arquetipos (2/2)', inner: pages.get('cap4-2') },
  { id: 'cap5', title: 'Cap. 5 — Patrones (1/2)', inner: pages.get('cap5'), tight: true },
  {
    id: 'cap5-2',
    title: 'Cap. 5 — Patrones (2/2)',
    inner: chapterContent(['cap5-2', 'cap5-3']),
  },
  { id: 'cap6', title: 'Cap. 6 — Patrones arquitectónicos', inner: pages.get('cap6') },
  { id: 'cap7', title: 'Cap. 7 — Branching', inner: pages.get('cap7') },
  { id: 'cap8', title: 'Cap. 8 — Buenas prácticas', inner: pages.get('cap8') },
  {
    id: 'cap9',
    title: 'Cap. 9 — Seguridad',
    inner: chapterContent(['cap9', 'cap9-2']),
    tight: true,
  },
  { id: 'cap10', title: 'Cap. 10 — Observabilidad', inner: pages.get('cap10') },
  { id: 'cap11', title: 'Cap. 11 — Base de datos (1/2)', inner: pages.get('cap11') },
  { id: 'cap11-2', title: 'Cap. 11 — Base de datos (2/2)', inner: pages.get('cap11-2') },
  {
    id: 'cap12',
    title: 'Cap. 12 — UX/UI (1/2)',
    inner: chapterContent(['cap12', 'cap12-2']),
  },
  { id: 'cap12-2', title: 'Cap. 12 — UX/UI (2/2)', inner: pages.get('cap12-3') },
  {
    id: 'cap13',
    title: 'Cap. 13 — Evidencias',
    inner: chapterContent(['cap13', 'cap13-2']),
  },
  {
    id: 'cap14',
    title: 'Cap. 14 — Conclusiones',
    inner: chapterContent(['cap14', 'cap14-2']),
  },
];

const out = layout.map(({ id, title, inner, tight }) => {
  const mainClass = tight ? 'sheet-main sheet-main--tight' : 'sheet-main';
  return `<section class="page page-break" id="${id}">
  <header class="sheet-head"><span class="sheet-head__brand">REV · Informe Técnico</span><span class="sheet-head__title">${title}</span></header>
  <div class="${mainClass}">
${inner.trim()}
  </div>
${foot()}`;
});

html = html.replace(
  /Versión<\/span><span class="cover-meta__value">[^<]+<\/span>/,
  'Versión</span><span class="cover-meta__value">1.3 — paginación equilibrada · rama dev</span>',
);

html =
  html.slice(0, start) +
  out.join('\n\n') +
  '\n\n' +
  html.slice(end).replace(
    /<strong>\d+ hojas A4<\/strong>/,
    `<strong>${out.length + 1} hojas A4</strong>`,
  );

fs.writeFileSync(filePath, html);
console.log('Rebalanced pages:', out.length + 1, '(+ portada)');
