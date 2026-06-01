# ms-zonas-riesgo

Microservicio de **zonas territoriales y evaluación de riesgo** — [REV](../../README.md).  
Puerto: **8082** · Base de datos: **PostGIS** `:5433`.

---

## Patrones de diseño

| Patrón | Implementación |
|--------|----------------|
| **Adapter (hexagonal)** | `WeatherDataPort` + `FakeWeatherAdapter` |
| **Repository** | `ZonaRepository`, `CondicionClimaticaRepository` |

El adaptador de clima es intercambiable (IoT / API real en el futuro) sin modificar `ZonaService`.

---

## Estructura

```
src/main/java/cl/duocuc/rev/zonas/
├── controller/
├── service/      ZonaService
├── port/         WeatherDataPort
├── adapter/      FakeWeatherAdapter
├── entity/
└── repository/
```

---

## API REST (interna)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/zonas` | Listar zonas |
| GET | `/zonas/{id}` | Detalle |
| GET | `/zonas/riesgo?lat=&lng=` | Evaluar riesgo por coordenadas |
| POST | `/zonas` | Crear |
| PUT | `/zonas/{id}` | Actualizar |

---

## Ejecución

```powershell
.\scripts\dev-up.ps1 -DockerApps
# o
mvn -pl businessdomain/ms-zonas-riesgo spring-boot:run
```

---

## Pruebas

```powershell
mvn -pl businessdomain/ms-zonas-riesgo test
```

Incluye `ZonaServiceTest`.
