# Guia: levantar REV en local (desarrollo)

Scripts en `scripts/`: `dev-up.ps1`, `dev-down.ps1` y `dev-ports-common.ps1`.

---

## Requisitos

| Requisito | Notas |
|-----------|--------|
| **Docker Desktop** | Infra + backend (modo `-DockerApps`) |
| **Java 21** | Compilacion de JARs (`mvnw.cmd`) |
| **Maven Wrapper** | Incluido (`mvnw.cmd`); no hace falta Maven global |
| **Node.js + npm** | Frontend `frontend/rev-dashboard` |
| **PowerShell 5.1+** | Scripts en `scripts/*.ps1` |

---

## Arranque recomendado (backend en Docker)

```powershell
.\scripts\dev-up.ps1 -DockerApps
```

1. Compila JARs si no existen en `target/` (usa `mvnw.cmd`).
2. Levanta **Docker** con perfil `apps`: PostgreSQL, Keycloak y **todos los microservicios Spring**.
3. Arranca el frontend con **`npm run dev`**.

Tras cambios en codigo Java:

```powershell
.\scripts\dev-up.ps1 -DockerApps -Build
```

Reconstruye JARs y reinicia contenedores (baje antes con `dev-down.ps1` si hace falta).

Si `/zonas` devuelve 404 en `api/mapa/territorial` pero `api/zonas` responde 200, el contenedor **bff-rev** lleva un JAR anterior: ejecute `-Build` de nuevo. El dashboard puede armar el mapa en cliente como respaldo, pero conviene reconstruir el BFF.

**Login 503 en `/auth/login`:** suele ser el gateway sin instancia de `KEYCLOAK-ADAPTER` en Eureka. En perfil `docker` el gateway enruta por nombre de servicio (`keycloak-adapter:8088`). Tras cambiar `api-gateway`, ejecute `.\scripts\dev-up.ps1 -DockerApps -Build` o `docker compose -p rev up -d --build api-gateway`.

### URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:15173 |
| API Gateway | http://localhost:18080 |
| Eureka | http://localhost:18761 |
| Keycloak | http://localhost:18090 (`admin` / `admin`) |
| Login app | `despachador` / `rev123` |

PostgreSQL en host: incidentes **15432**, zonas **15433**, recursos **15434** (Rakin IA usa **5432**).

---

## Modo desarrollo con Maven local (debug en IDE)

Para depurar con breakpoints en el IDE, sin contenedores JVM:

```powershell
.\scripts\dev-up.ps1
```

1. Docker solo levanta PostgreSQL + Keycloak.
2. Abre ventanas PowerShell con `spring-boot:run` por microservicio.
3. Frontend en Vite.

---

## Opciones utiles

```powershell
# Backend Docker, recompilar siempre
.\scripts\dev-up.ps1 -DockerApps -Build

# Solo infra Docker
.\scripts\dev-up.ps1 -SkipBackend -SkipFrontend

# Sin frontend
.\scripts\dev-up.ps1 -DockerApps -SkipFrontend

# Bajar contenedores
.\scripts\dev-down.ps1

# Bajar contenedores + cerrar Vite en puerto 5173
.\scripts\dev-down.ps1 -StopDevPorts

# Resetear BD local
.\scripts\dev-down.ps1 -RemoveVolumes
```

### Logs del backend en Docker

```powershell
docker compose -p rev logs -f api-gateway
docker compose -p rev ps
```

---

## Login falla con credenciales correctas

Usuarios de desarrollo (realm `rev`): `admin`, `despachador` o `brigadista` con clave `rev123`. Use el **username**, no solo el correo.

### Probar el backend sin el navegador

```powershell
curl.exe -s -w "\nHTTP:%{http_code}" -X POST "http://localhost:18080/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=admin&password=rev123"
```

| Código HTTP | Significado habitual |
|-------------|----------------------|
| **200** | Login OK; si la UI falla, revise proxy Vite → gateway `18080` |
| **401** | Usuario/clave incorrectos o client secret distinto |
| **404/503** | `KEYCLOAK-ADAPTER` no registrado en Eureka o Keycloak no listo |
| **500/502** | Keycloak caído o adaptador sin conectar a Keycloak |

### Realm no importado (volumen antiguo)

Keycloak importa `docker/keycloak/rev-realm.json` solo en el **primer** arranque del volumen. Si no existen usuarios en http://localhost:18090 (realm `rev` → Users):

```powershell
.\scripts\dev-down.ps1 -RemoveVolumes
.\scripts\dev-up.ps1 -DockerApps -Build
```

Esto borra datos locales de PostgreSQL y Keycloak.

### Servicios a revisar

```powershell
docker compose -p rev ps
docker compose -p rev logs --tail=40 keycloak-adapter
```

En Eureka (http://localhost:18761) debe aparecer **KEYCLOAK-ADAPTER** en estado UP.

---

## Mapa territorial y zonas Puente Alto (`/zonas`)

Tras login, abra **Zonas** en el menú del despacho. Valle del Sol = comuna **Puente Alto** (demo académica).

| Pestaña | Descripción |
|---------|-------------|
| **Mapa territorial** | OSM, círculos nativos (`centerLat` + `radioMetros`), incidentes y clusters |
| **Administración de zonas** | CRUD de zonas estratégicas, vista previa del buffer, desactivar (baja lógica), recalcular asignaciones |

| Elemento | Descripción |
|----------|-------------|
| Capa OSM | Misma base que el reporte público (OpenStreetMap) |
| Círculos de zona | Buffer Haversine ≤ `radioMetros` (seed Flyway V3 en `ms-zonas-riesgo`) |
| Círculos de incidente | Radio de correlación (`rev.mapa.radio-correlacion-metros`, default 500 m) |
| Marcadores agrupados | Cluster al alejar zoom; un marcador por grupo canónico |
| Detalle | Clic en círculo/marcador → panel lateral y popup (incluye `zonaNombre` si hay snapshot) |

**Deep link desde incidentes:** en la tarjeta del dashboard, **Ver en mapa** abre `/zonas?incidente={id}` y centra el mapa.

**API BFF (JWT):** `GET /api/mapa/territorial`, `GET/POST/PUT/DELETE /api/zonas`, `POST /api/incidentes/recalcular-zonas`.

Tras cambios en Flyway (`V3` zonas, `V6` incidente `zona_id`) o en CRUD de zonas del BFF: `.\scripts\dev-up.ps1 -DockerApps -Build` (reconstruye `bff-rev` y `ms-zonas-riesgo`). Si `PUT/POST /api/zonas` devuelve 404, el contenedor BFF suele llevar un JAR anterior.

Estándares y trazabilidad: [estandares-gis-despacho-rev.md](./estandares-gis-despacho-rev.md).

---

## Detener

```powershell
.\scripts\dev-down.ps1 -StopDevPorts
```

Cierra contenedores (infra + apps) y libera el puerto del frontend.

Si uso Maven local, cierre tambien las ventanas PowerShell de los microservicios (Ctrl+C).
