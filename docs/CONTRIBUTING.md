# Gu�a de contribuci�n � REV

## Commits

### Formato

```
[ TIPO ]: Detalles del commit
```

### Tipos

| Tipo | Descripci�n |
|------|-------------|
| `FEAT` | Nueva funcionalidad |
| `FIX` | Correcci�n de error |
| `REFACTOR` | Refactorizaci�n sin cambio de comportamiento |
| `DOCS` | Solo documentaci�n |
| `TEST` | Pruebas |
| `INFRA` | Infraestructura (Eureka, Gateway, Docker, CI) |
| `BUILD` | Build, Maven, dependencias |
| `CHORE` | Mantenimiento, config, reglas |

### Atomicidad

Cada commit debe representar **un solo cambio l�gico**. Ejemplos:

- ? `[ INFRA ]: Agregar m�dulo eureka-server`
- ? `[ FEAT ]: Implementar transici�n Reportado ? En Progreso`
- ? Mezclar nuevo MS + refactor del BFF + actualizaci�n del README

### Operaciones Git

- **Commits**: permitidos siguiendo este formato.
- **Push / merge / rebase**: solo cuando el responsable del repo lo indique expl�citamente.

## Estructura del repositorio

Ver [AGENTS.md](../AGENTS.md) y el informe de arquitectura en `docs/`.

## Desarrollo local (resumen)

1. Levantar PostgreSQL y Keycloak (`docker-compose up -d`)
2. Arrancar `eureka-server` (8761)
3. Arrancar microservicios y BFF
4. Arrancar `api-gateway` (8080) y frontend (5173)

## Calidad

- Tests en flujos cr�ticos (estados de incidente, fallbacks BFF).
- JaCoCo en m�dulos con l�gica de negocio.
- No commitear secretos ni archivos en `.gitignore`.

## Roles Keycloak (dev)

- `Despachador` � acceso al panel y API v�a gateway
- `Brigadista` � consulta limitada
- `Admin` � administraci�n
