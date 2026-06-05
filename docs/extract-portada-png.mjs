/**
 * Renderiza la 1ª página del PDF de portada a PNG (Playwright + PDF.js CDN).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfSrc = process.argv[2] || path.join(process.env.USERPROFILE || '', 'Downloads', 'portada presentación rev v2.pdf');
const pdfLocal = path.join(__dirname, 'presentacion-assets', 'portada-rev-source.pdf');
const outPath = path.join(__dirname, 'presentacion-assets', 'portada-rev.png');

if (!fs.existsSync(pdfSrc)) {
  console.error('PDF no encontrado:', pdfSrc);
  process.exit(1);
}

fs.mkdirSync(path.dirname(pdfLocal), { recursive: true });
fs.copyFileSync(pdfSrc, pdfLocal);

const pdfB64 = fs.readFileSync(pdfLocal).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const html = `<!DOCTYPE html><html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head><body style="margin:0;background:#fff">
<canvas id="c"></canvas>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
(async () => {
  const data = atob('${pdfB64}');
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i);
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pg = await pdf.getPage(1);
  const vp = pg.getViewport({ scale: 2 });
  const canvas = document.getElementById('c');
  canvas.width = vp.width;
  canvas.height = vp.height;
  await pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  document.body.setAttribute('data-ready', '1');
})();
</script></body></html>`;

await page.setContent(html, { waitUntil: 'load' });
await page.waitForFunction(() => document.body.getAttribute('data-ready') === '1', { timeout: 60000 });
await page.locator('#c').screenshot({ path: outPath, type: 'png' });
await browser.close();

console.log('OK:', outPath);
