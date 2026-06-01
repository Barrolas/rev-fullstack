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

## Detener

```powershell
.\scripts\dev-down.ps1 -StopDevPorts
```

Cierra contenedores (infra + apps) y libera el puerto del frontend.

Si uso Maven local, cierre tambien las ventanas PowerShell de los microservicios (Ctrl+C).
