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

### 1. Infraestructura Docker

```powershell
docker compose up -d
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
