# ms-recursos

Microservicio de **logística de emergencia** — brigadas, vehículos y herramientas — [REV](../../README.md).  
Puerto: **8083** · Base de datos: PostgreSQL `:5434`.

---

## Patrones de diseño

| Patrón | Implementación |
|--------|----------------|
| **Repository** | `BrigadaRepository`, `VehiculoRepository`, `HerramientaRepository`, `AsignacionRepository` |

---

## Estructura

```
src/main/java/cl/duocuc/rev/recursos/
├── controller/   RecursoController
├── service/      RecursoService
├── entity/       Brigada, Vehiculo, Herramienta, Asignacion
└── repository/
```

---

## API REST (interna)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/recursos/disponibles` | Brigadas, vehículos y herramientas disponibles |
| GET | `/recursos/incidente/{id}` | Recursos asignados a un incidente |
| POST | `/recursos/asignar` | Asignar brigada (vehículo opcional) |
| DELETE | `/recursos/asignar/{id}` | Desasignar |
| POST | `/recursos/brigadas` | Alta brigada |
| POST | `/recursos/vehiculos` | Alta vehículo |
| POST | `/recursos/herramientas` | Alta herramienta |

---

## Ejecución

```powershell
.\scripts\dev-up.ps1 -DockerApps
# o
mvn -pl businessdomain/ms-recursos spring-boot:run
```

---

## Pruebas

```powershell
mvn -pl businessdomain/ms-recursos test
```

Incluye `RecursoServiceCatalogoTest`.
