# bff-rev — Backend For Frontend

Microservicio de orquestación para el dashboard React de [REV](../../README.md).  
Puerto: **8085** · Registrado en Eureka como `BFF-REV`.

---

## Rol arquitectónico

- **Patrón Facade:** agrega incidente + riesgo + recursos en `DashboardResponse`.
- **Circuit Breaker:** Resilience4j con fallbacks; expone `degraded: true` si un MS falla.
- **Capa anticorrupción (DDD):** traduce tres bounded contexts a un contrato único para la UI.

---

## Estructura

```
src/main/java/cl/duocuc/rev/bff/
├── controller/     DashboardController, OperacionesController, PublicController
├── service/        DashboardFacadeService, OperacionesFacadeService
├── client/         WebClient hacia ms-incidentes, ms-zonas, ms-recursos
├── cache/          ZonaRiesgoCache
└── dto/            DashboardResponse, IncidenteDto, etc.
```

---

## Endpoints expuestos (vía Gateway)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/incidentes` | Listado agregado |
| GET | `/api/dashboard/incidente/{id}` | Detalle agregado |
| POST | `/api/incidentes` | Crear incidente (autenticado) |
| POST | `/api/public/incidentes` | Reporte ciudadano (sin JWT) |
| GET | `/api/zonas` | Listado de zonas |
| GET | `/api/recursos/disponibles` | Recursos disponibles |
| POST | `/api/recursos/asignar` | Asignar brigada/vehículo |

---

## Ejecución

### Con Docker (recomendado)

Desde la raíz del monorepo:

```powershell
.\scripts\dev-up.ps1 -DockerApps
```

### Maven local

```powershell
# Requiere Eureka + MS de negocio en ejecución
mvn -pl infraestructuredomain/bff-rev spring-boot:run
```

---

## Pruebas

```powershell
mvn -pl infraestructuredomain/bff-rev test
```

Incluye `OperacionesFacadeServiceTest`.

---

## Patrones

Ver [docs/patrones-y-arquitectura-rev.md](../../docs/patrones-y-arquitectura-rev.md) — §4.3 Facade, §5 Circuit Breaker.
