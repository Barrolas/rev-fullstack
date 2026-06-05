/**
 * Audita cada slide Marp: overflow, tablas cortadas, elementos fuera del viewport.
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildMd = path.join(__dirname, 'presentacion-rev-build.md');
const htmlOut = path.join(__dirname, 'presentacion-rev-audit.html');
const shotsDir = path.join(__dirname, 'presentacion-audit-shots');

if (!fs.existsSync(buildMd)) {
  execSync('node preprocess-mermaid-presentacion.mjs', { cwd: __dirname, stdio: 'inherit' });
}

execSync(
  `npx --yes @marp-team/marp-cli@4.1.2 --no-stdin "${buildMd}" -o "${htmlOut}" --allow-local-files --html`,
  { cwd: __dirname, stdio: 'inherit' },
);

fs.mkdirSync(shotsDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`file:///${htmlOut.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const slides = await page.evaluate(() => {
  const root = document.querySelector('[id=":$p"]');
  const sections = root
    ? [...root.querySelectorAll('svg foreignObject section')]
    : [...document.querySelectorAll('section')];
  return sections.map((sec, i) => {
    const title = sec.querySelector('h1')?.textContent?.trim() || `(slide ${i + 1})`;
    const classes = sec.className || '';
    const secH = sec.clientHeight;
    const secScroll = sec.scrollHeight;
    const overflowY = secScroll - secH;

    const clipped = [];
    for (const el of sec.querySelectorAll('table, .rev-panel, .rev-diagram-img, .rev-shot, pre, .rev-deck, .rev-card, blockquote')) {
      const r = el.getBoundingClientRect();
      const sr = sec.getBoundingClientRect();
      const bottom = r.bottom - sr.top;
      const right = r.right - sr.left;
      if (bottom > secH + 2) {
        clipped.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').slice(0, 60),
          overflowBottom: Math.round(bottom - secH),
        });
      }
      if (right > sec.clientWidth + 2) {
        clipped.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').slice(0, 60),
          overflowRight: Math.round(right - sec.clientWidth),
        });
      }
    }

    const tables = [...sec.querySelectorAll('table')].map((t) => ({
      rows: t.querySelectorAll('tr').length,
      scrollH: t.scrollHeight,
      clientH: t.clientHeight,
      cut: t.scrollHeight > t.clientHeight + 2,
    }));

    return {
      index: i + 1,
      title: title.slice(0, 55),
      classes,
      secH,
      overflowY: Math.round(overflowY),
      clipped: clipped.slice(0, 6),
      tables,
      bad: overflowY > 8 || clipped.length > 0 || tables.some((t) => t.cut),
    };
  });
});

// PNG por slide vía Marp CLI (más fiable que bespoke viewer)
execSync(
  `npx --yes @marp-team/marp-cli@4.1.2 --no-stdin "${buildMd}" -o "${path.join(shotsDir, 'slide.png')}" --allow-local-files --images png`,
  { cwd: __dirname, stdio: 'pipe' },
);

console.log('\n=== Auditoría slides REV (1280×720) ===\n');
const badSlides = slides.filter((s) => s.bad);
for (const s of slides) {
  const flag = s.bad ? '⚠️' : '✓';
  let detail = '';
  if (s.overflowY > 8) detail += ` overflowY=${s.overflowY}px`;
  if (s.tables.some((t) => t.cut)) detail += ' TABLE-CUT';
  if (s.clipped.length) detail += ` clipped=${s.clipped.length}`;
  console.log(`${flag} #${String(s.index).padStart(2)} ${s.title}${detail}`);
  for (const c of s.clipped) {
    console.log(`     → ${c.tag}.${c.cls} ${c.overflowBottom ? `↓${c.overflowBottom}px` : ''}${c.overflowRight ? `→${c.overflowRight}px` : ''}`);
  }
}
console.log(`\nTotal: ${slides.length} slides · ${badSlides.length} con problemas`);
console.log(`Capturas: ${shotsDir}`);

await browser.close();
process.exit(badSlides.length ? 1 : 0);
