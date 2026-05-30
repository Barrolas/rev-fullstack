---
name: rev-commit
description: >-
  Ejecuta commits at�micos en REV con formato [ TIPO ]: Detalles del commit.
  Usar cuando el usuario pida commitear, cerrar una fase del plan, o registrar
  un cambio at�mico. Nunca hace push ni merge.
---

# REV � Commits at�micos

## Formato

```
[ TIPO ]: Detalles del commit
```

Tipos: `FEAT`, `FIX`, `REFACTOR`, `DOCS`, `TEST`, `INFRA`, `BUILD`, `CHORE`.

## Workflow

1. `git status` y `git diff` (staged + unstaged).
2. Identificar la unidad l�gica; si hay mezcla, separar en commits distintos.
3. `git add` solo archivos de esa unidad.
4. Commit con HEREDOC en PowerShell/bash seg�n shell del entorno.
5. `git status` para confirmar �xito.

## Atomicidad por fase del plan

| Fase | Commit sugerido |
|------|-----------------|
| Scaffold parent POM | `[ BUILD ]: Configurar rev-parent con BOM Spring Boot 4 y Cloud 2025` |
| eureka-server | `[ INFRA ]: Agregar eureka-server en puerto 8761` |
| ms-incidentes | `[ FEAT ]: Implementar ms-incidentes con Factory Method` |
| Reglas Cursor | `[ CHORE ]: Agregar reglas y skills de desarrollo REV` |

## Prohibido

- `git push`, `git merge`, `git pull`, `git rebase` sin pedido expl�cito.
- Commitear `.env`, secretos o `target/`.
- Mensajes fuera del formato `[ TIPO ]: ...`.

## Ejemplo PowerShell

```powershell
git commit -m "[ FEAT ]: Agregar endpoint GET /incidentes/{id} en ms-incidentes"
```

## Si el hook rechaza el mensaje

Corregir el formato y crear un **nuevo** commit; no usar `--amend` salvo que el usuario lo pida y el commit no est� pusheado.
