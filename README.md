# REV - Red de Emergencia Valle

Plataforma microservicios para gestion de emergencias - Municipalidad de Valle del Sol.

## Documentacion

- [Guia de contribucion](docs/CONTRIBUTING.md)
- [AGENTS.md](AGENTS.md)
- PDFs de arquitectura en `docs/`

## Stack

Java 21, Spring Boot 4.0.x, Spring Cloud 2025.1.x, Eureka, Gateway, Resilience4j, PostgreSQL/PostGIS, Keycloak, React, Docker

## Estructura

```
businessdomain/          ms-incidentes, ms-zonas-riesgo, ms-recursos
infraestructuredomain/   eureka-server, api-gateway, keycloak-adapter, spring-boot-admin, bff-rev
frontend/rev-dashboard/  React + Vite
archetypes/              Maven archetype para nuevos MS
```

## Arranque rapido

### Stack completo con backend en Docker (recomendado)

Abre **Docker Desktop** y desde la raiz del repo:

```powershell
.\scripts\dev-up.ps1 -DockerApps
```

Compila JARs (automatico si faltan) y levanta PostgreSQL, Keycloak y microservicios Spring en contenedores. El frontend sigue en Vite local.

Tras cambios en Java:

```powershell
.\scripts\dev-down.ps1
.\scripts\dev-up.ps1 -DockerApps -Build
```

### Desarrollo con Maven local (debug en IDE)

```powershell
.\scripts\dev-up.ps1
```

Opciones:

```powershell
.\scripts\dev-up.ps1 -DockerApps          # backend en contenedores
.\scripts\dev-up.ps1 -DockerApps -Build   # recompilar JARs antes
.\scripts\dev-up.ps1 -SkipDocker          # solo Maven + frontend
.\scripts\dev-up.ps1 -SkipBackend         # solo Docker (+ frontend)
.\scripts\dev-up.ps1 -SkipFrontend        # sin Vite
.\scripts\dev-down.ps1                    # baja contenedores Docker
.\scripts\dev-down.ps1 -StopDevPorts      # baja Docker + libera puertos dev
.\scripts\dev-down.ps1 -RemoveVolumes     # resetea datos Postgres local
```

Atajos equivalentes: `run-all.ps1`, `stop-rev.ps1`, `start-rev.ps1` (solo Docker).

Ver [docs/guia-entorno-local.md](docs/guia-entorno-local.md).

### 1. Infraestructura Docker sola

```powershell
docker compose -p rev up -d
# o: .\scripts\start-rev.ps1
```

### 2. Servicios Spring (terminales separadas)

```powershell
mvn -pl infraestructuredomain/eureka-server spring-boot:run
mvn -pl infraestructuredomain/spring-boot-admin spring-boot:run
mvn -pl businessdomain/ms-incidentes spring-boot:run
mvn -pl businessdomain/ms-zonas-riesgo spring-boot:run
mvn -pl businessdomain/ms-recursos spring-boot:run
mvn -pl infraestructuredomain/bff-rev spring-boot:run
mvn -pl infraestructuredomain/keycloak-adapter spring-boot:run
mvn -pl infraestructuredomain/api-gateway spring-boot:run
```

### 3. Frontend

```powershell
cd frontend/rev-dashboard
npm install
npm run dev
```

## URLs

| Servicio | URL |
|----------|-----|
| Eureka | http://localhost:8761 |
| Gateway | http://localhost:8080 |
| Spring Boot Admin | http://localhost:8099 |
| Keycloak | http://localhost:8090 |
| Frontend | http://localhost:5173 |

**Login dev:** `despachador` / `rev123`

## Build

```powershell
mvn verify
```

## Commits

Formato: `[ TIPO ]: Detalles del commit` - ver [CONTRIBUTING.md](docs/CONTRIBUTING.md)
