# Evidencias del informe técnico REV

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
