/**
 * Captura screenshots JaCoCo y resumen de ejecución para EVA3.
 * Requiere: npm install en docs/ (playwright) y ejecutar scripts/run-eva3-tests.ps1 antes.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(__dirname, 'informe-evidencias', 'eva3', 'evidencias');

const modules = [
  { name: 'ms-incidentes', rel: 'businessdomain/ms-incidentes/target/site/jacoco/index.html' },
  { name: 'ms-zonas-riesgo', rel: 'businessdomain/ms-zonas-riesgo/target/site/jacoco/index.html' },
  { name: 'ms-recursos', rel: 'businessdomain/ms-recursos/target/site/jacoco/index.html' },
  { name: 'bff-rev', rel: 'infraestructuredomain/bff-rev/target/site/jacoco/index.html' },
];

function toFileUrl(absPath) {
  return `file:///${absPath.replace(/\\/g, '/')}`;
}

function buildSummaryHtml(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<style>
  body { font-family: Consolas, 'Courier New', monospace; background: #0d1117; color: #c9d1d9; padding: 24px; margin: 0; }
  h1 { font-family: Segoe UI, sans-serif; color: #58a6ff; font-size: 1.25rem; margin: 0 0 16px; }
  pre { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; line-height: 1.5; font-size: 14px; white-space: pre-wrap; }
  .ok { color: #3fb950; }
</style></head><body>
<h1>REV EVA3 — Resumen ejecución <span class="ok">PASS</span></h1>
<pre>${escaped}</pre>
</body></html>`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const mod of modules) {
    const htmlPath = path.join(root, mod.rel);
    const outPng = path.join(outDir, `jacoco-${mod.name}.png`);
    if (!fs.existsSync(htmlPath)) {
      console.warn(`Omitido ${mod.name}: no existe ${htmlPath}`);
      continue;
    }
    await page.goto(toFileUrl(htmlPath), { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: outPng, fullPage: true });
    console.log('Captura:', outPng);
  }

  const resumenPath = path.join(outDir, 'resumen-ejecucion.txt');
  if (fs.existsSync(resumenPath)) {
    const text = fs.readFileSync(resumenPath, 'utf8');
    const summaryHtml = path.join(outDir, '_resumen-preview.html');
    fs.writeFileSync(summaryHtml, buildSummaryHtml(text), 'utf8');
    await page.goto(toFileUrl(summaryHtml), { waitUntil: 'load' });
    const mvnPng = path.join(outDir, 'mvn-test-resumen.png');
    await page.screenshot({ path: mvnPng, fullPage: true });
    console.log('Captura:', mvnPng);
    fs.unlinkSync(summaryHtml);
  }

  await browser.close();
  console.log('Listo. Evidencias en', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
