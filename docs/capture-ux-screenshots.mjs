/**
 * Captura screenshots reales del dashboard REV para el informe.
 * Requiere: npm run build + vite preview (puerto 4173) o dev en 5173.
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const frontend = path.join(root, 'frontend', 'rev-dashboard');
const outDir = path.join(__dirname, 'informe-evidencias');
const PORT = Number(process.env.REV_CAPTURE_PORT || 15173);
const BASE = `http://127.0.0.1:${PORT}`;

function waitForServer(url, ms = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      http
        .get(url, (res) => {
          res.resume();
          resolve(true);
        })
        .on('error', () => {
          if (Date.now() - start > ms) reject(new Error('Preview server timeout'));
          else setTimeout(tick, 400);
        });
    };
    tick();
  });
}

function startDevServer() {
  return spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: frontend,
    shell: true,
    stdio: 'ignore',
  });
}

async function dismissBoot(page) {
  await page
    .waitForFunction(() => !document.documentElement.classList.contains('rev-boot-active'), {
      timeout: 12000,
    })
    .catch(() => {});
  await page.waitForTimeout(600);
}

async function tryLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await dismissBoot(page);
  await page.locator('#tab-ingresar, button:has-text("Ingresar")').first().click({ timeout: 3000 }).catch(() => {});
  await page.fill('#login-user, input[name="username"], input[type="text"]', 'despachador').catch(() =>
    page.locator('input[type="text"]').first().fill('despachador'),
  );
  await page.fill('#login-pass, input[type="password"]', 'rev123').catch(() =>
    page.locator('input[type="password"]').first().fill('rev123'),
  );
  await page.locator('button[type="submit"], button:has-text("Ingresar al panel")').first().click();
  await page.waitForURL(/\/(inicio)?$/, { timeout: 8000 }).catch(() => {});
  await dismissBoot(page);
  return page.url().includes('login') === false;
}

async function waitForPanelReady(page) {
  await page
    .waitForFunction(
      () =>
        !document.body.innerText.includes('Conectando con servicios REV') &&
        !document.body.innerText.includes('Cargando'),
      { timeout: 20000 },
    )
    .catch(() => {});
  await page.waitForTimeout(800);
}

async function capture(page, file, url, setup) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded' });
  await dismissBoot(page);
  if (setup) await setup(page);
  await waitForPanelReady(page);
  await page.screenshot({
    path: path.join(outDir, file),
    fullPage: false,
    type: 'png',
  });
  console.log('  ✓', file);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Building frontend…');
  const build = spawn('npm', ['run', 'build'], { cwd: frontend, shell: true, stdio: 'inherit' });
  await new Promise((res, rej) => build.on('close', (c) => (c === 0 ? res() : rej(new Error('build failed')))));
  const preview = startDevServer();
  await waitForServer(BASE);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Rutas públicas primero (sin sesión)
  await capture(page, 'fig16-login-reporte.png', '/login', async (p) => {
    await p.locator('#tab-reportar').click();
    await p.waitForSelector('#panel-reportar', { timeout: 8000 });
  });

  await capture(page, 'fig16b-portal.png', '/portal', async (p) => {
    await p.waitForSelector('.portal-page, main', { timeout: 8000 }).catch(() => {});
  });

  const loggedIn = await tryLogin(page);
  console.log(loggedIn ? 'Login OK — capturas panel interno' : 'Sin sesión — solo UI pública');

  if (loggedIn) {
    await capture(page, 'fig14-dispatch.png', '/', async (p) => {
      await p.waitForSelector('.app-shell, main', { timeout: 8000 }).catch(() => {});
    });
    await capture(page, 'fig15-incidentes.png', '/incidentes', async (p) => {
      await p.waitForSelector('.incidentes-page, .module-hub, main', { timeout: 8000 }).catch(() => {});
    });
    await capture(page, 'fig15b-zonas.png', '/zonas', async (p) => {
      await p.waitForSelector('.leaflet-container, .zonas-page, main', { timeout: 10000 }).catch(() => {});
    });
  }

  await browser.close();
  preview.kill('SIGTERM');
  console.log('Capturas guardadas en docs/informe-evidencias/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
