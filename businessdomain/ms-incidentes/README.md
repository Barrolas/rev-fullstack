# ms-incidentes

Microservicio de **gestión del ciclo de vida de incidentes** — [REV](../../README.md).  
Puerto: **8081** · Base de datos: PostgreSQL `:5432`.

---

## Patrones de diseño

| Patrón | Implementación |
|--------|----------------|
| **Factory Method + State** | `IncidentStateFactory`, `ReportadoState`, `EnProgresoState`, etc. |
| **Repository** | `IncidenteRepository`, `TransicionEstadoRepository` |

Estados: `REPORTADO` → `EN_PROGRESO` → `CONTROLADO` / `ESCALADO` → `CERRADO`.

---

## Estructura

```
src/main/java/cl/duocuc/rev/incidentes/
├── controller/   IncidenteController
├── service/      IncidenteService
├── state/        IncidentStateFactory, *State
├── entity/       Incidente, TransicionEstado
├── repository/
└── dto/
```

---

## API REST (interna — vía BFF/Gateway)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/incidentes` | Listar |
| GET | `/incidentes/{id}` | Obtener por UUID |
| POST | `/incidentes` | Crear |
| PUT | `/incidentes/{id}/transicion` | Cambiar estado (Factory) |

---

## Ejecución

```powershell
# Docker (stack completo)
.\scripts\dev-up.ps1 -DockerApps

# Maven local
mvn -pl businessdomain/ms-incidentes spring-boot:run
```

---

## Pruebas

```powershell
mvn -pl businessdomain/ms-incidentes test
```

Incluye `IncidentStateFactoryTest`.

---

## Migraciones

Flyway en `src/main/resources/db/migration/`.
