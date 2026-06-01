# Estrategia de ramas y commits — avances REV (EVA2)

Ramas cortas por unidad lógica; commits con formato `[ TIPO ]: Detalle`.

## Rama integradora (historial completo)

| Rama | Tip (commit) | Descripción |
|------|----------------|-------------|
| `feature/public-report-incidente-login` | `b347d18` | Todos los avances EVA2 en orden lineal (reporte público → correlación → recursos → resiliencia → UI → docs) |

```text
main ──…── eaa56f9 ── 3311e52 ── 0d7a36c ── 9e65e85 ── 66c5246 ── 764a5af ── … ── b347d18
              │ reporte MS    │ BFF/gw   │ KC ciudadano │ UI pública │ infra │ flyway │
              └────────────── feature/public-report-incidente-login ──────────────────┘
```

## Ramas temáticas (punteros al tip de cada bloque)

Cada rama apunta a un commit en la misma línea ancestral que la integradora. Al abrir un PR contra `main`, Git incluirá los commits previos necesarios (no hace falta cherry-pick si se mergea desde la integradora o en orden).

| Rama | Commit | Incluye (resumen) |
|------|--------|-------------------|
| `feature/public-report-incidente-login` | `b347d18` | Todo lo de abajo + documentación |
| `fix/infra-login-arranque` | `2a28687` | Puertos 15xxx/18xxx, gateway/BFF/keycloak resiliencia, retry/login UI |
| `feature/ms-incidentes-correlacion-backend` | `11931fd` | Flyway V5, motor correlación MS, tests, BFF correlación/dashboard |
| `feature/frontend-correlaciones-incidentes` | `ae52da8` | Pestañas correlaciones en módulo Incidentes |
| `feature/ms-recursos-brigadas-admin` | `da9a30d` | MS brigadas + BFF recursos + UI administración y despacho |
| `feature/frontend-incidente-mapa-interno` | `718460d` | Formulario interno + mapa OSM (sobre reporte público previo) |

Reporte público (sin correlación/recursos posteriores): commits `eaa56f9` … `9e65e85` en la misma rama integradora.

## Commits atómicos (orden cronológico)

| # | Hash | Mensaje |
|---|------|---------|
| 1 | `66c5246` | `[ INFRA ]: Alinear puertos 15xxx y 18xxx en Docker, scripts y properties` |
| 2 | `764a5af` | `[ FIX ]: Renumerar Flyway reporte publico y corregir hash adjuntos en ms-incidentes` |
| 3 | `4c91e20` | `[ FEAT ]: Implementar motor y API de correlacion de incidentes en ms-incidentes` |
| 4 | `fbf0282` | `[ TEST ]: Agregar pruebas unitarias de correlacion en ms-incidentes` |
| 5 | `11931fd` | `[ FEAT ]: Exponer correlacion y enriquecer dashboard en bff-rev` |
| 6 | `cb26f90` | `[ FEAT ]: Agregar brigadistas, composicion de brigada y despacho en ms-recursos` |
| 7 | `824dba8` | `[ FEAT ]: Agregar API de administracion de recursos en bff-rev` |
| 8 | `8141e30` | `[ FIX ]: Mejorar resiliencia de arranque en gateway, BFF y keycloak-adapter` |
| 9 | `2a28687` | `[ FIX ]: Agregar reintentos API, BackendReadyGate y mensajes de login en frontend` |
| 10 | `ae52da8` | `[ FEAT ]: Integrar correlaciones en modulo Incidentes del dashboard` |
| 11 | `da9a30d` | `[ FEAT ]: Agregar administracion de recursos y despacho de brigada en UI` |
| 12 | `718460d` | `[ FEAT ]: Agregar formulario interno y reporte publico con mapa OSM mejorado` |
| 13 | `b347d18` | `[ DOCS ]: Documentar correlacion, troubleshooting login y estrategia de ramas` |

(Anteriores en la misma rama: reporte público `eaa56f9`, `3311e52`, `0d7a36c`, `9e65e85`.)

## Orden de merge sugerido (mantenedor)

1. `fix/infra-login-arranque` → `main` o `dev`
2. `feature/public-report-incidente-login` (reporte público + flyway), si aún no está integrado
3. `feature/ms-incidentes-correlacion-backend` + `feature/frontend-correlaciones-incidentes` (o merge directo de la integradora)
4. `feature/ms-recursos-brigadas-admin`
5. `feature/frontend-incidente-mapa-interno`

**Nota:** `git cherry-pick` desde `main` puede generar conflictos (puertos, docker-compose, README). Es más seguro mergear PRs desde `feature/public-report-incidente-login` o mergear la integradora una vez revisada.

## Comandos útiles

```powershell
# Commits de la integradora respecto a main
git log main..feature/public-report-incidente-login --oneline

# Commits de un bloque (ej. solo correlación backend)
git log 764a5af^..11931fd --oneline

# Listar ramas temáticas
git branch -v | Select-String "feature|fix"
```

No se hace `git push` salvo solicitud explícita.
