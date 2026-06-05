# Documentación REV

Índice de documentación del proyecto **Red de Emergencia Valle** (DSY1106 — Duoc UC).

---

## Informes y evaluación

| Documento | Descripción |
|-----------|-------------|
| [eva2-fullstack-rubrica.md](eva2-fullstack-rubrica.md) | Rúbrica oficial EVA2 |
| [informe-sistema-rev.md](informe-sistema-rev.md) | Informe funcional: UI, backend, API, permisos |
| [informe-tecnico-integral-rev.html](informe-tecnico-integral-rev.html) | **Informe técnico integral EVA2** — exportar a PDF desde el navegador ([contrato A4](informe-tecnico-A4-contrato.md)) |
| [presentacion-rev-final.md](presentacion-rev-final.md) | **Presentación Marp** — fuente editable; HTML/PDF con `npm run build:presentacion:html` |
| [Presentacion-REV-EVA2-v5.html](Presentacion-REV-EVA2-v5.html) | **Presentación HTML** — 29 slides, tema REV; generar con `npm run build:presentacion:html` |
| [patrones-y-arquitectura-rev.md](patrones-y-arquitectura-rev.md) | Arquitectura, arquetipos y patrones con trazabilidad al código |
| [guia-entorno-local.md](guia-entorno-local.md) | Arranque con Docker, Maven y Vite |
| [estandares-gis-despacho-rev.md](estandares-gis-despacho-rev.md) | Referencia GIS/CAD para mapa y despacho |

---

## Entregables exportados (PDF)

| Archivo | Uso |
|---------|-----|
| `Presentacion-REV-EVA2-v5.pdf` | Presentación EVA2 (generar con `npm run build:presentacion`) |
| `Presentación Proyecto REV - DSY1106 - … (2).pdf` | Copia con nombre oficial de entrega |
| `Informe Técnico de Diseño de Arquitectura REV - … (1).pdf` | Informe de arquitectura (referencia) |
| `F EFT Municipalidad - Alcance (1).docx` | Alcance funcional municipal |

---

## Desarrollo en equipo

| Documento | Descripción |
|-----------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branching (`main` / `dev`) y formato de commits |
| [estrategia-ramas-commits-eva2.md](estrategia-ramas-commits-eva2.md) | Mapa de ramas y commits del avance EVA2 |

---

## Material de curso

Referencia teórica: [Resumen EA2 — Arquitecturas Modernas…](Resumen%20EA2_%20Arquitecturas%20Modernas,%20Patrones%20y%20Ecosistemas%20de%20Microservicios.md)

---

## Scripts (`docs/`)

Requieren `npm install` en esta carpeta (Playwright solo para capturas/auditoría).

| Comando | Descripción |
|---------|-------------|
| `npm run build:presentacion:html` | Genera `Presentacion-REV-EVA2-v5.html` (visor Marp + tema REV inlined) |
| `npm run build:presentacion` | Genera `Presentacion-REV-EVA2-v5.pdf` desde Marp + diagramas SVG |
| `npm run build:presentacion:all` | HTML + auditoría + PDF en un solo flujo |
| `npm run audit:presentacion` | Audita overflow/layout de cada slide |
| `npm run capture:ux` | Regenera capturas en `informe-evidencias/` |
| `node audit-informe-pages.mjs` | Audita desbordes del informe HTML |
| `node patch-informe-ux.mjs` | Actualiza figuras UX en el informe |
| `node informe-wrap-pages.mjs` | Re-particiona capítulos del informe (mantenimiento) |

Artefactos generados (no versionados): `presentacion-rev-build.md`, `presentacion-diagramas/*.svg`, capturas de auditoría.

---

## Componentes del monorepo

| Componente | README |
|------------|--------|
| Monorepo | [../README.md](../README.md) |
| Frontend | [../frontend/rev-dashboard/README.md](../frontend/rev-dashboard/README.md) |
| BFF | [../infraestructuredomain/bff-rev/README.md](../infraestructuredomain/bff-rev/README.md) |
| ms-incidentes | [../businessdomain/ms-incidentes/README.md](../businessdomain/ms-incidentes/README.md) |
| ms-zonas-riesgo | [../businessdomain/ms-zonas-riesgo/README.md](../businessdomain/ms-zonas-riesgo/README.md) |
| ms-recursos | [../businessdomain/ms-recursos/README.md](../businessdomain/ms-recursos/README.md) |
