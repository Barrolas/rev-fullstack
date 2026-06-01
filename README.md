# REV — Red de Emergencia Valle

Plataforma fullstack de **misión crítica** para la gestión de emergencias municipales — Municipalidad de Valle del Sol.  
Curso **DSY1106** — Desarrollo Fullstack III, Duoc UC.

**Lema:** *Conectividad que salva vidas*

---

## Descripción

REV es un ecosistema **cloud-native** basado en microservicios Spring Cloud, con dashboard React para el despacho municipal y portal público para reportes ciudadanos sin registro.

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, TypeScript, Vite 5, Bootstrap 5 |
| Backend | Java 21, Spring Boot 4.0.x, Spring Cloud 2025.1.x |
| Infra | Docker, Eureka, API Gateway, Keycloak, PostgreSQL / PostGIS |
| Resiliencia | Resilience4j (Circuit Breaker), fallbacks, modo degradado en UI |

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [Informe integral del sistema](docs/informe-sistema-rev.md) | Funcionalidades, arquitectura, UI, API, design system |
| [Patrones y arquitectura](docs/patrones-y-arquitectura-rev.md) | Arquitectura, arquetipos, patrones backend/frontend → código |
| [Rúbrica EVA2](docs/eva2-fullstack-rubrica.md) | Indicadores, ponderación encargo/defensa oral, checklist de entrega |
| [Guía entorno local](docs/guia-entorno-local.md) | Arranque, Docker, Maven, scripts |
| [Guía de contribución](docs/CONTRIBUTING.md) | Commits, branching (`main` / `dev`) |
| [Frontend README](frontend/rev-dashboard/README.md) | Componente NPM, patrones React, scripts |

---

## Estructura del monorepo

```
rev-fullstack/
├── businessdomain/              Microservicios de negocio
│   ├── ms-incidentes/           Ciclo de vida de incidentes (Factory + State)
│   ├── ms-zonas-riesgo/         Zonas PostGIS + Adapter climático
│   └── ms-recursos/             Brigadas, vehículos, herramientas
├── infraestructuredomain/       Plataforma
│   ├── bff-rev/                 Backend For Frontend — Facade + Circuit Breaker
│   ├── api-gateway/             Enrutamiento + JWT
│   ├── keycloak-adapter/        Autenticación
│   ├── eureka-server/           Service discovery
│   └── spring-boot-admin/       Monitorización
├── frontend/rev-dashboard/      SPA React (componente NPM)
├── archetypes/
│   └── rev-microservice-archetype/   Arquetipo Maven para nuevos MS
├── scripts/                     dev-up.ps1, dev-down.ps1
└── docs/                        Informes y guías
```

---

## Patrones de diseño (resumen)

### Backend

| Patrón | Ubicación |
|--------|-----------|
| **Factory Method + State** | `ms-incidentes` → `IncidentStateFactory`, `*State.java` |
| **Adapter** | `ms-zonas-riesgo` → `WeatherDataPort`, `FakeWeatherAdapter` |
| **Facade** | `bff-rev` → `DashboardFacadeService`, `OperacionesFacadeService` |
| **Repository** | Spring Data JPA en cada microservicio |
| **Circuit Breaker** | Resilience4j en BFF → flag `degraded` en JSON |

### Frontend

| Patrón | Ubicación |
|--------|-----------|
| **Provider (Context)** | `UiContext`, `ToastContext`, `LayoutContext` |
| **Custom Hook** | `useApiQuery`, `useAuth`, `useWeather` |
| **Facade API** | `src/api.ts` — cliente del BFF |
| **Observer** | `incidentCreatedTick` — refresco tras crear incidente |
| **Composite** | `ModuleHub` — layout KPI + toolbar + rail |

Detalle y trazabilidad: [docs/patrones-y-arquitectura-rev.md](docs/patrones-y-arquitectura-rev.md).

---

## Arranque rápido

### Requisitos

- Docker Desktop
- Java 21
- Node.js + npm
- PowerShell 5.1+

### Stack completo (recomendado)

Abre **Docker Desktop** y desde la raíz del repo:

```powershell
.\scripts\dev-up.ps1 -DockerApps
```

Compila JARs si faltan, levanta infra + microservicios en Docker y arranca Vite en `:5173`.

Tras cambios en código Java:

```powershell
.\scripts\dev-down.ps1
.\scripts\dev-up.ps1 -DockerApps -Build
```

### Solo frontend (backend ya corriendo)

```powershell
cd frontend/rev-dashboard
npm install
npm run dev
```

### Maven local (debug con breakpoints en IDE)

```powershell
.\scripts\dev-up.ps1
```

Más opciones: [docs/guia-entorno-local.md](docs/guia-entorno-local.md).

---

## URLs de desarrollo

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Portal público** | http://localhost:5173/portal |
| **API Gateway** | http://localhost:8080 |
| **Eureka** | http://localhost:8761 |
| **Keycloak** | http://localhost:8090 |
| **Spring Boot Admin** | http://localhost:8099 |

### Credenciales dev

| Usuario | Rol | Clave |
|---------|-----|-------|
| `despachador` | Despachador | `rev123` |
| `brigadista` | Brigadista | `rev123` |
| `admin` | Admin | `rev123` |

Keycloak admin: `admin` / `admin`

---

## Rutas principales (frontend)

| Ruta | Acceso |
|------|--------|
| `/portal` | Público — reporte ciudadano |
| `/login` | Login operadores |
| `/inicio` | Bienvenida (autenticado) |
| `/` | Despacho / dashboard |
| `/incidentes` | Gestión de incidentes |
| `/zonas` | Mapa y zonas de riesgo |
| `/recursos` | Logística de emergencia |

---

## Build y pruebas

```powershell
# Backend — compilar y tests
mvn verify

# Frontend — producción
cd frontend/rev-dashboard
npm run build
```

Tests de patrones destacados: `IncidentStateFactoryTest`, `ZonaServiceTest`, `OperacionesFacadeServiceTest`.

---

## Arquetipo Maven

Generar un nuevo microservicio alineado al monorepo:

```powershell
cd archetypes/rev-microservice-archetype
mvn install
```

Ver [archetypes/rev-microservice-archetype/README.md](archetypes/rev-microservice-archetype/README.md).

---

## Git y contribución

- Rama **`dev`**: desarrollo activo
- Rama **`main`**: estable para entrega/demo
- Commits: `[ TIPO ]: Descripción` — ver [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

Tipos: `FEAT`, `FIX`, `REFACTOR`, `DOCS`, `TEST`, `INFRA`, `BUILD`, `CHORE`.

---

## API consumida por el frontend

| Método | Ruta |
|--------|------|
| POST | `/auth/login` |
| POST | `/api/public/incidentes` (portal, sin JWT) |
| GET | `/api/dashboard/incidentes` |
| GET | `/api/dashboard/incidente/{id}` |
| POST | `/api/incidentes` |
| GET | `/api/zonas` |
| GET | `/api/recursos/disponibles` |
| POST | `/api/recursos/asignar` |

---

*Proyecto académico DSY1106 — Duoc UC. Documentación verificada contra el código en `rev-fullstack`.*
