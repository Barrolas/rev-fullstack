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
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| Keycloak | http://localhost:8090 (`admin` / `admin`) |
| Login app | `despachador` / `rev123` |

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

## Detener

```powershell
.\scripts\dev-down.ps1 -StopDevPorts
```

Cierra contenedores (infra + apps) y libera el puerto del frontend.

Si uso Maven local, cierre tambien las ventanas PowerShell de los microservicios (Ctrl+C).
