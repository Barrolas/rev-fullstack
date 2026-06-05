/**
 * Sincroniza imágenes institucionales REV a docs/images/ para slides con panel visual.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendAssets = path.join(__dirname, '..', 'frontend', 'rev-dashboard', 'public', 'assets');
const dstDir = path.join(__dirname, 'images');
const logoDst = path.join(__dirname, 'presentacion-assets');

const IMAGES = [
  'rev-imag-04.png',
  'rev-imag-05.png',
  'rev-imag-06.png',
  'rev-field-team.png',
  'rev-about-dispatch.png',
  'rev-about-map.png',
  'rev-about-portal.png',
  'rev-device.png',
  'login-hero.jpg',
  'rev-closing-hero.png',
  'rev-slide-portal.png',
  'rev-slide-persist.png',
  'rev-slide-git.png',
  'rev-slide-roadmap.png',
];

const LOGOS = ['emblem-light.png', 'emblem-color.png'];

fs.mkdirSync(dstDir, { recursive: true });
fs.mkdirSync(logoDst, { recursive: true });

let copied = 0;
for (const name of IMAGES) {
  const from = path.join(frontendAssets, 'images', name);
  const to = path.join(dstDir, name);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    copied += 1;
  }
}

let logos = 0;
for (const name of LOGOS) {
  const from = path.join(frontendAssets, 'logos', name);
  const to = path.join(logoDst, name);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    logos += 1;
  }
}

console.log(`images/: ${copied}/${IMAGES.length} institucionales · logos: ${logos}/${LOGOS.length}`);
