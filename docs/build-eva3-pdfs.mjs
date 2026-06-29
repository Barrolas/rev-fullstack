/**
 * Exporta informe, plan y matriz EVA3 a PDF (Playwright).
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eva3Dir = path.join(__dirname, 'informe-evidencias', 'eva3');

const docs = [
  { md: 'informe-pruebas-eva3.md', pdf: 'informe-pruebas-eva3.pdf' },
  { md: 'plan-de-pruebas-eva3.md', pdf: 'plan-de-pruebas-eva3.pdf' },
  { md: 'matriz-de-pruebas-eva3.md', pdf: 'matriz-de-pruebas-eva3.pdf' },
];

function mdToHtml(md, baseDir) {
  const body = md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, href) => {
      const resolved = href.startsWith('http') ? href : `file:///${path.join(baseDir, href).replace(/\\/g, '/')}`;
      return `<a href="${resolved}">${t}</a>`;
    });

  const lines = body.split('\n');
  const out = [];
  let inPre = false;
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    out.push('<table>');
    tableRows.forEach((row, i) => {
      const cells = row.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.every((c) => /^[-:]+$/.test(c.trim()))) return;
      const tag = i === 0 || (tableRows[1] && tableRows[1].includes('---')) ? 'th' : 'td';
      if (row.includes('---')) return;
      out.push('<tr>' + cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>');
    });
    out.push('</table>');
    tableRows = [];
    inTable = false;
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inPre) {
        flushTable();
        out.push('<pre><code>');
        inPre = true;
      } else {
        out.push('</code></pre>');
        inPre = false;
      }
      continue;
    }
    if (inPre) {
      out.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }
    if (line.trim().startsWith('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    }
    if (inTable) flushTable();
    if (line.trim() === '') {
      out.push('');
      continue;
    }
    if (!line.startsWith('<')) out.push(`<p>${line}</p>`);
    else out.push(line);
  }
  flushTable();
  if (inPre) out.push('</code></pre>');

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<style>
  @page { margin: 18mm 16mm; }
  body { font-family: 'Segoe UI', Calibri, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1a1a1a; max-width: 100%; }
  h1 { font-size: 18pt; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; color: #1e3a5f; }
  h2 { font-size: 13pt; margin-top: 1.2em; color: #2c5282; }
  h3 { font-size: 11pt; color: #2d3748; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9pt; }
  th, td { border: 1px solid #cbd5e0; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: #edf2f7; }
  pre, code { font-family: Consolas, monospace; font-size: 8.5pt; }
  pre { background: #f7fafc; border: 1px solid #e2e8f0; padding: 10px; overflow-x: auto; border-radius: 4px; }
  blockquote { border-left: 4px solid #4299e1; margin: 8px 0; padding: 4px 12px; color: #4a5568; background: #ebf8ff; }
  img { max-width: 100%; height: auto; margin: 8px 0; border: 1px solid #e2e8f0; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  a { color: #2b6cb0; }
</style></head><body>${out.join('\n')}</body></html>`;
}

function embedImages(html, baseDir) {
  return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const imgPath = path.resolve(baseDir, src);
    if (!fs.existsSync(imgPath)) return `<p><em>[Imagen pendiente: ${src}]</em></p>`;
    const b64 = fs.readFileSync(imgPath).toString('base64');
    const ext = path.extname(imgPath).slice(1) || 'png';
    return `<figure><img src="data:image/${ext};base64,${b64}" alt="${alt}"/><figcaption>${alt}</figcaption></figure>`;
  });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const doc of docs) {
    const mdPath = path.join(eva3Dir, doc.md);
    const pdfPath = path.join(eva3Dir, doc.pdf);
    if (!fs.existsSync(mdPath)) {
      console.warn('Omitido:', doc.md);
      continue;
    }
    let md = fs.readFileSync(mdPath, 'utf8');
    md = embedImages(md, eva3Dir);
    const html = mdToHtml(md, eva3Dir);
    const tmp = path.join(eva3Dir, `_pdf-${doc.pdf}.html`);
    fs.writeFileSync(tmp, html, 'utf8');
    await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
    });
    fs.unlinkSync(tmp);
    console.log('PDF:', pdfPath);
  }

  await browser.close();
  console.log('Exportación EVA3 completada.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
