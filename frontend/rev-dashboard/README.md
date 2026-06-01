# rev-dashboard — Frontend REV

Componente **NPM** del ecosistema [REV](../../README.md) (*Red de Emergencia Valle*).  
SPA React + TypeScript + Vite para despacho municipal y portal ciudadano.

---

## Requisitos

- Node.js 18+
- npm
- Backend REV en ejecución (Gateway `:8080`) — ver [guía de entorno](../../docs/guia-entorno-local.md)

---

## Instalación y ejecución

```powershell
cd frontend/rev-dashboard
npm install
npm run dev
```

Abre http://localhost:5173

### Scripts (`package.json`)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo Vite (proxy → Gateway) |
| `npm run build` | Compila TypeScript + bundle de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción |

---

## Estructura

```
src/
├── pages/           Vistas por ruta (contenedores)
├── components/      UI reutilizable y por dominio
│   ├── incidentes/
│   ├── recursos/
│   ├── zonas/
│   ├── portal/
│   ├── layout/      AppShell, Sidebar, Topbar, ModuleHub
│   └── primitives/  KpiCard, StateView, RevModal
├── hooks/           useApiQuery, useAuth, useWeather
├── contexts/        UiContext, ToastContext, LayoutContext
├── utils/           Filtros y agregados (funciones puras)
├── styles/          CSS por módulo + theme.css
├── api.ts           Facade HTTP — único acceso al backend REV
├── App.tsx          Rutas
└── main.tsx         Punto de entrada
public/
└── assets/          Logos e imágenes institucionales
```

---

## Patrones de diseño (frontend)

El dashboard es **cliente del BFF**: no orquesta microservicios; consume el JSON agregado del backend.

| Patrón | Problema que resuelve | Archivos |
|--------|----------------------|----------|
| **Provider (Context)** | Estado global sin prop drilling | `contexts/UiContext.tsx`, `ToastContext.tsx`, `LayoutContext.tsx` |
| **Custom Hook** | Reutilizar fetch, auth y efectos | `hooks/useApiQuery.ts`, `useAuth.ts`, `useWeather.ts` |
| **Facade** | Centralizar HTTP, JWT y errores | `api.ts` |
| **Observer** | Refrescar listas tras crear incidente | `incidentCreatedTick` en `UiContext` |
| **Composite** | Layout común KPI + toolbar + rail | `components/layout/ModuleHub.tsx` |
| **Strategy** | Filtros intercambiables | `utils/incidentesFilters.ts`, `recursosUtils.ts` |
| **State (UI)** | Estados loading / error / empty | `components/primitives/StateView.tsx` |
| **Guard** | Proteger rutas autenticadas | `components/ProtectedLayout.tsx` |

Documentación completa: [docs/patrones-y-arquitectura-rev.md](../../docs/patrones-y-arquitectura-rev.md) §7.

---

## Rutas

| Ruta | Componente | Auth |
|------|------------|------|
| `/portal` | PortalPage | No |
| `/login` | LoginPage | No |
| `/inicio` | InicioPage | Sí |
| `/` | DashboardPage | Sí |
| `/incidentes` | IncidentesPage | Sí |
| `/incidentes/:id` | IncidentDetailPage | Sí |
| `/zonas` | ZonasPage | Sí |
| `/recursos` | RecursosPage | Sí |

---

## Relación con el backend

```
React (api.ts) → API Gateway (:8080) → BFF (:8085) → 3 microservicios
```

- **Autenticado:** `apiFetch` envía `Authorization: Bearer` (JWT en `localStorage`).
- **Portal público:** `createPublicIncidente()` → `POST /api/public/incidentes` (sin token).
- **Modo degradado:** el BFF devuelve `degraded: true`; la UI muestra alertas y KPIs.

---

## Design system

Paleta **monocromática institucional + naranja** `#f97316`.  
Tokens en `src/theme.css`; estilos por módulo en `src/styles/`.

---

## Build de producción

```powershell
npm run build
```

Salida en `dist/`. Servir con cualquier host estático o `npm run preview`.

---

## Pruebas manuales sugeridas

1. `/portal` — reporte sin login
2. `/login` — `despachador` / `rev123`
3. `/incidentes` — filtros, vista tarjetas/tabla, panel lateral
4. Crear incidente (modal) — verificar refresco automático en listado
5. `/zonas` — mapa Leaflet + filtros
6. `/recursos` — tablas y rail lateral

---

*Parte del monorepo REV — DSY1106 Duoc UC.*
