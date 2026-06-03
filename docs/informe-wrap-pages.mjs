import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'informe-tecnico-integral-rev.html');
let html = fs.readFileSync(filePath, 'utf8');

function foot() {
  return `  <footer class="sheet-foot"><span>Duoc UC · DSY1106 · REV</span><span class="sheet-foot__num"></span></footer>\n</section>`;
}

function wrapPage(id, headTitle, inner) {
  return `<section class="page page-break" id="${id}">
  <header class="sheet-head"><span class="sheet-head__brand">REV · Informe Técnico</span><span class="sheet-head__title">${headTitle}</span></header>
  <div class="sheet-main">
${inner.trim()}
  </div>
${foot()}`;
}

function stripHeaderBar(s) {
  return s.replace(/\s*<div class="header-bar">[\s\S]*?<\/div>\s*/g, '\n');
}

const splits = [
  {
    id: 'resumen',
    pages: [
      {
        id: 'resumen',
        title: 'Resumen ejecutivo (1/2)',
        from: null,
        custom: (c) => {
          const exec = c.match(/<div class="exec-box">[\s\S]*?<\/div>/)[0];
          const p = c.match(/<p>Este informe documenta[\s\S]*?<\/p>/)[0];
          return `<h1>Resumen ejecutivo</h1>\n${exec}\n${p}`;
        },
      },
      {
        id: 'resumen-2',
        title: 'Resumen ejecutivo (2/2)',
        custom: (c) => c.match(/<table>[\s\S]*?<\/table>/)[0],
      },
    ],
  },
  {
    id: 'cap1',
    pages: [
      {
        id: 'cap1',
        title: 'Cap. 1 — Introducción (1/2)',
        custom: (c) => {
          const intro = c.match(/<p class="chapter-intro">[\s\S]*?<\/p>/)[0];
          const h1 = '<h1>1. Introducción</h1>';
          const part = c.slice(c.indexOf('<h3>1.1'), c.indexOf('<h3 id="cap1-1">'));
          return `${h1}\n${intro}\n${part}`;
        },
      },
      {
        id: 'cap1-2',
        title: 'Cap. 1 — Introducción (2/2)',
        custom: (c) => c.slice(c.indexOf('<h3 id="cap1-1">')),
      },
    ],
  },
  {
    id: 'cap2',
    pages: [
      {
        id: 'cap2',
        title: 'Cap. 2 — Descripción (1/2)',
        custom: (c) => c.slice(0, c.indexOf('<h3>2.2')),
      },
      {
        id: 'cap2-2',
        title: 'Cap. 2 — Descripción (2/2)',
        custom: (c) => c.slice(c.indexOf('<h3>2.2')),
      },
    ],
  },
  {
    id: 'cap3',
    pages: [
      {
        id: 'cap3',
        title: 'Cap. 3 — Arquitectura (1/4)',
        custom: (c) => {
          const end = c.indexOf('</div>', c.indexOf('<div class="mermaid">')) + 6;
          return c.slice(0, end);
        },
      },
      {
        id: 'cap3-2',
        title: 'Cap. 3 — Arquitectura (2/4)',
        custom: (c) => {
          const start = c.indexOf('<h3>3.2');
          const end = c.indexOf('<h3>3.3');
          return c.slice(start, end);
        },
      },
      {
        id: 'cap3-3',
        title: 'Cap. 3 — Arquitectura (3/4)',
        custom: (c) => {
          const start = c.indexOf('<h3>3.3');
          const end = c.indexOf('<h3>3.4');
          return c.slice(start, end);
        },
      },
      {
        id: 'cap3-4',
        title: 'Cap. 3 — Arquitectura (4/4)',
        custom: (c) => c.slice(c.indexOf('<h3>3.4')),
      },
    ],
  },
  {
    id: 'cap4',
    pages: [
      {
        id: 'cap4',
        title: 'Cap. 4 — Arquetipos (1/2)',
        custom: (c) => c.slice(0, c.indexOf('<h3>4.2')),
      },
      {
        id: 'cap4-2',
        title: 'Cap. 4 — Arquetipos (2/2)',
        custom: (c) => c.slice(c.indexOf('<h3>4.2')),
      },
    ],
  },
  {
    id: 'cap5',
    pages: [
      {
        id: 'cap5',
        title: 'Cap. 5 — Patrones (1/3)',
        custom: (c) => c.slice(0, c.indexOf('<h3>5.3')),
      },
      {
        id: 'cap5-2',
        title: 'Cap. 5 — Patrones (2/3)',
        custom: (c) => {
          const start = c.indexOf('<h3>5.3');
          const end = c.indexOf('<h3>5.6');
          return c.slice(start, end);
        },
      },
      {
        id: 'cap5-3',
        title: 'Cap. 5 — Patrones (3/3)',
        custom: (c) => c.slice(c.indexOf('<h3>5.6')),
      },
    ],
  },
  {
    id: 'cap9',
    pages: [
      {
        id: 'cap9',
        title: 'Cap. 9 — Seguridad (1/2)',
        custom: (c) => c.slice(0, c.indexOf('<h3>9.2')),
      },
      {
        id: 'cap9-2',
        title: 'Cap. 9 — Seguridad (2/2)',
        custom: (c) => c.slice(c.indexOf('<h3>9.2')),
      },
    ],
  },
  {
    id: 'cap11',
    pages: [
      {
        id: 'cap11',
        title: 'Cap. 11 — Base de datos (1/2)',
        custom: (c) => c.slice(0, c.indexOf('<div class="mermaid">')),
      },
      {
        id: 'cap11-2',
        title: 'Cap. 11 — Base de datos (2/2)',
        custom: (c) => c.slice(c.indexOf('<div class="mermaid">')),
      },
    ],
  },
  {
    id: 'cap12',
    pages: [
      {
        id: 'cap12',
        title: 'Cap. 12 — UX/UI (1/3)',
        custom: (c) => c.slice(0, c.indexOf('<h3>12.3')),
      },
      {
        id: 'cap12-2',
        title: 'Cap. 12 — UX/UI (2/3)',
        custom: (c) => {
          const start = c.indexOf('<h3>12.3');
          const end = c.indexOf('<div class="fig-placeholder">');
          return c.slice(start, end);
        },
      },
      {
        id: 'cap12-3',
        title: 'Cap. 12 — UX/UI (3/3)',
        custom: (c) => c.slice(c.indexOf('<div class="fig-placeholder">')),
      },
    ],
  },
  {
    id: 'cap13',
    pages: [
      {
        id: 'cap13',
        title: 'Cap. 13 — Evidencias (1/2)',
        custom: (c) => c.slice(0, c.indexOf('<div class="fig-placeholder">')),
      },
      {
        id: 'cap13-2',
        title: 'Cap. 13 — Evidencias (2/2)',
        custom: (c) => c.slice(c.indexOf('<div class="fig-placeholder">')),
      },
    ],
  },
  {
    id: 'cap14',
    pages: [
      {
        id: 'cap14',
        title: 'Cap. 14 — Conclusiones (1/2)',
        custom: (c) => c.slice(0, c.indexOf('<h3>14.3')),
      },
      {
        id: 'cap14-2',
        title: 'Cap. 14 — Conclusiones (2/2)',
        custom: (c) => c.slice(c.indexOf('<h3>14.3')),
      },
    ],
  },
];

const splitIds = new Set(splits.map((s) => s.id));

const start = html.indexOf('<!-- ═══════════════ RESUMEN');
const end = html.indexOf('<p class="no-print footer-note"');
let body = html.slice(start, end);

const sectionRe = /<section class="page page-break" id="([^"]+)">([\s\S]*?)<\/section>/g;
const sections = [];
let m;
while ((m = sectionRe.exec(body)) !== null) {
  sections.push({ id: m[1], content: stripHeaderBar(m[2]) });
}

const out = [];
for (const sec of sections) {
  const split = splits.find((s) => s.id === sec.id);
  if (split) {
    for (const page of split.pages) {
      const inner = page.custom ? page.custom(sec.content) : sec.content;
      out.push(wrapPage(page.id, page.title, inner));
    }
  } else {
    const titleMatch = sec.content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const head = titleMatch ? titleMatch[1].trim() : sec.id;
    out.push(wrapPage(sec.id, head, sec.content));
  }
}

html = html.slice(0, start) + out.join('\n\n') + '\n\n' + html.slice(end);
fs.writeFileSync(filePath, html);
console.log('Pages:', out.length);
