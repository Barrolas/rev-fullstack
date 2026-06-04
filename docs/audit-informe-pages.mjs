/**
 * Audita contenido natural (sin min-height) vs área imprimible.
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'informe-tecnico-integral-rev.html');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'print' });
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const results = await page.evaluate(() => {
  const mmToPx = (mm) => (mm * 96) / 25.4;
  const limit = mmToPx(269);
  document.querySelectorAll('.page:not(.page--cover)').forEach((el) => {
    el.style.minHeight = 'auto';
    el.style.height = 'auto';
  });
  return [...document.querySelectorAll('.page')].map((el, i) => {
    const head = el.querySelector('.sheet-head');
    const main = el.querySelector('.sheet-main');
    const foot = el.querySelector('.sheet-foot');
    const natural =
      (head?.offsetHeight || 0) + (main?.scrollHeight || 0) + (foot?.offsetHeight || 0);
    return {
      index: i + 1,
      id: el.id || `page-${i + 1}`,
      naturalPx: natural,
      limitPx: Math.round(limit),
      overflowPx: Math.round(natural - limit),
      mainPx: main?.scrollHeight || 0,
    };
  });
});

console.log('Contenido natural vs límite 269mm\n');
const bad = results.filter((r) => r.id !== 'portada' && r.overflowPx > 10);
for (const r of results) {
  if (r.id === 'portada') continue;
  const flag = r.overflowPx > 10 ? ' ⚠️ OVERFLOW' : r.overflowPx > 0 ? ' ~tight' : ' OK';
  console.log(
    `#${String(r.index).padStart(2)} ${r.id.padEnd(12)} natural=${r.naturalPx}px main=${r.mainPx}px +${r.overflowPx}${flag}`,
  );
}
console.log(`\n${bad.length} página(s) desbordada(s)`);
await browser.close();
process.exit(bad.length ? 1 : 0);
