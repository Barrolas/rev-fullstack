# AGENTS.md � Gu�a para agentes IA (REV)

## Proyecto

**Red de Emergencia Valle (REV)** � microservicios Spring Cloud para gesti�n de emergencias.
Curso DSY1106, Duoc UC. Monorepo Maven en `rev-fullstack/`.

## Antes de codificar

1. Leer `.cursor/rules/rev-project.mdc` (contexto global).
2. Si commiteas: `.cursor/rules/git-commits.mdc` + skill `rev-commit`.
3. Si ramificas o integras: `.cursor/rules/git-branching-rev.mdc`.
4. Si implementas fases: skill `rev-develop`.
5. Si creas un MS nuevo: skill `rev-microservice`.

## Git � reglas estrictas

| Acci�n | �Permitido? |
|--------|-------------|
| `git commit` (at�mico) | S�, con formato `[ TIPO ]: Detalles` |
| `git push` | **No**, salvo pedido expl�cito |
| `git merge` / `rebase` / `pull` | **No**, salvo pedido expl�cito |
| Crear PR / mergear PR | **No**, salvo pedido expl�cito |

## Branching

- `main` estable � `dev` integraci�n � `feature/*` (o `fix/*`, etc.) para trabajo diario.
- Antes de implementar, sugerir rama desde `dev`; si depende de otra feature no mergeada, sub-rama desde la rama actual.
- Merge feature ? `dev` (validaci�n); `dev` ? `main` solo cuando hay versi�n estable.
- Detalle completo: [CONTRIBUTING.md](docs/CONTRIBUTING.md) y `.cursor/rules/git-branching-rev.mdc`.

## Commits at�micos

Un commit = una unidad l�gica. Tipos: `FEAT`, `FIX`, `REFACTOR`, `DOCS`, `TEST`, `INFRA`, `BUILD`, `CHORE`.

Ejemplo: `[ INFRA ]: Agregar eureka-server con puerto 8761`

## Stack

Java 21 � Spring Boot 4.0.x � Spring Cloud 2025.1.x � Eureka � Gateway � Resilience4j � PostgreSQL/PostGIS � Keycloak � React � Docker

## Patrones de dominio

- **Factory Method** ? ms-incidentes
- **Adapter** ? ms-zonas-riesgo (FakeWeatherAdapter)
- **Facade** ? bff-rev

## Referencia

Proyecto ejemplo: `paymentchainparent` (estructura y patrones Spring Cloud).

## Documentaci�n humana

- [CONTRIBUTING.md](docs/CONTRIBUTING.md) � convenciones para contribuidores
- PDFs de arquitectura en `docs/`
