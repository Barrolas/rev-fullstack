# Guia de contribucion — REV

## Estrategia de ramas

GitFlow simplificado: **ramas de trabajo → `dev` → `main`**.

| Rama | Proposito |
|------|-----------|
| `main` | Codigo estable, listo para demo o entrega. Solo recibe merges desde `dev` cuando una version esta validada. |
| `dev` | Integracion. Aqui convergen las features terminadas y revisadas. |
| `feature/*`, `fix/*`, etc. | Trabajo diario. Una unidad logica por rama. |

### Diagrama

```
main          ← release estable (cuando el responsable lo decida)
  ↑
 dev          ← merge de features validadas
  ↑
feature/xxx   ← desarrollo y commits atomicos
```

### Convencion de nombres

| Prefijo | Uso |
|---------|-----|
| `feature/` | Nueva funcionalidad |
| `fix/` | Correccion de bug |
| `refactor/` | Refactorizacion sin cambio de comportamiento |
| `chore/` | Mantenimiento, docs, config |

Ejemplos: `feature/ms-incidentes-estado-en-progreso`, `fix/bff-rev-timeout-zonas-riesgo`, `chore/docs-orden-de-arranque`.

### Flujo de trabajo

1. Actualizar `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Crear rama para la tarea (desde `dev`):
   ```bash
   git checkout -b feature/<modulo>-<descripcion-corta>
   ```
3. Desarrollar y commitear con formato atomico (ver seccion Commits).
4. Push de la rama cuando corresponda:
   ```bash
   git push -u origin feature/<modulo>-<descripcion-corta>
   ```
5. El responsable del repo mergea la feature a `dev` cuando la valida.
6. Cuando `dev` tenga una version estable, el responsable mergea `dev` → `main`.

### Desde donde ramificar

| Situacion | Rama base |
|-----------|-----------|
| Nueva tarea independiente | `dev` |
| Nueva tarea que depende de otra feature aun no mergeada | Sub-rama desde la rama feature actual |

### Reglas

- **No commitear directamente en `main`** salvo hotfixes urgentes acordados.
- **No mergear features directamente a `main`**: el camino es feature → `dev` → `main`.
- **No hacer merge a `main`** sin revision previa del estado de `dev`.
- **Una tarea = una rama**. Evitar mezclar alcances distintos en la misma rama.
- **Push / merge / rebase** hacia remoto: solo cuando el responsable del repo lo indique explicitamente.

## Commits

### Formato

```
[ TIPO ]: Detalles del commit
```

### Tipos

| Tipo | Descripcion |
|------|-------------|
| `FEAT` | Nueva funcionalidad |
| `FIX` | Correccion de error |
| `REFACTOR` | Refactorizacion sin cambio de comportamiento |
| `DOCS` | Solo documentacion |
| `TEST` | Pruebas |
| `INFRA` | Infraestructura (Eureka, Gateway, Docker, CI) |
| `BUILD` | Build, Maven, dependencias |
| `CHORE` | Mantenimiento, config, reglas |

### Atomicidad

Cada commit debe representar **un solo cambio logico**. Ejemplos:

- Bien: `[ INFRA ]: Agregar modulo eureka-server`
- Bien: `[ FEAT ]: Implementar transicion Reportado a En Progreso`
- Mal: Mezclar nuevo MS + refactor del BFF + actualizacion del README

## Estructura del repositorio

Ver [AGENTS.md](../AGENTS.md) y el informe de arquitectura en `docs/`.

## Desarrollo local (resumen)

1. Levantar PostgreSQL y Keycloak (`docker compose up -d`)
2. Arrancar `eureka-server` (8761)
3. Arrancar microservicios y BFF
4. Arrancar `api-gateway` (8080) y frontend (5173)

## Calidad

- Tests en flujos criticos (estados de incidente, fallbacks BFF).
- JaCoCo en modulos con logica de negocio.
- No commitear secretos ni archivos en `.gitignore`.

## Roles Keycloak (dev)

- `Despachador` — acceso al panel y API via gateway
- `Brigadista` — consulta limitada
- `Admin` — administracion
