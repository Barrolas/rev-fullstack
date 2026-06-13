# Evidencias del informe técnico REV

## Video demo — tour por módulos (5 min)

Guion híbrido de grabación (reporte en vivo, módulos, admin, SBA :18099): [guion-video-tour-modulos.md](./guion-video-tour-modulos.md). Plan futuro reportes vs incidentes: [plan-reportes-vs-incidentes-v2.md](../plan-reportes-vs-incidentes-v2.md).

## Capturas UX reales (Playwright)

Generadas con `node docs/capture-ux-screenshots.mjs` (requiere stack Docker + `vite` en :15173).

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `fig14-dispatch.png` | `/` | Despacho — centro de operaciones |
| `fig15-incidentes.png` | `/incidentes` | Listado, filtros y correlaciones |
| `fig15b-zonas.png` | `/zonas` | Mapa Leaflet / PostGIS |
| `fig16-login-reporte.png` | `/login` (Reportar) | Formulario público por pasos |
| `fig16b-portal.png` | `/portal` | Landing ciudadana |

Figuras 1–13 y 17–20: extractos de código/config embebidos en el HTML.

Regenerar capturas UX: `node docs/capture-ux-screenshots.mjs`  
Actualizar referencias en el informe: `node docs/patch-informe-ux.mjs`
