# Instrucciones de equipo — Evaluación Parcial 3 (EVA3)

| Campo | Valor |
|-------|-------|
| **Proyecto** | REV — Red de Emergencia Valle |
| **Asignatura** | DSY1106 — Desarrollo Fullstack III |
| **Integrantes** | Nicolás Barra · Giannina Guerrero |
| **Sección** | 306-V |
| **Ponderación** | Encargo 30 % · Defensa oral 70 % |

---

## 1. Qué entrega el equipo

| Entregable | Formato | Responsable principal |
|------------|---------|------------------------|
| Informe de arquitectura (sin cambios EVA2) | PDF anexo | Ambos (reutilizar) |
| **Informe de pruebas** (unitarias + integración + E2E) | PDF | Nicolás |
| Plan de pruebas | PDF / MD | Nicolás |
| Matriz de pruebas | XLSX / MD | Nicolás |
| Diagrama arquitectura | PDF/PNG (EVA2) | Giannina (referencia) |
| Descripción persistencia | PDF (extracto informe-sistema) | Nicolás |
| Código + tests en GitHub | Repo monorepo | Ambos |
| ZIP Blackboard | `REV-EVA3-Barra-Guerrero.zip` | Nicolás |
| **Video arquitectura** | MP4 | Giannina |
| **Video plataforma (uso)** | MP4 | Nicolás |
| **PPT defensa** | PPTX/PDF | Ambos (fecha defensa, no encargo mañana) |

### Entrega mañana (checklist + encargo)

Solo lo exigido por **CHECKLIST.xlsx** y PDF EVA3:

| Sí entregar | No entregar mañana |
|-------------|-------------------|
| 2 videos: arquitectura + plataforma/uso | Video aparte de ejecución de pruebas |
| Informe + plan + matriz de pruebas (PDF) | PPT defensa oral |
| Capturas JaCoCo / consola en ZIP | Clip de pruebas (solo para exposición oral) |
| Código + tests en GitHub | |

> **Video de pruebas:** el profesor lo mencionó para la **presentación oral** (clip en PPT o capturas en informe), no como tercer ítem del checklist. Guion opcional: [guion-video-ejecucion-pruebas-eva3.md](./guion-video-ejecucion-pruebas-eva3.md).

---

## 2. División de trabajo

### Giannina

| Tarea | Documento guía | Tiempo estimado |
|-------|----------------|-----------------|
| Grabar video arquitectura (52 ítems checklist) | [guion-video-arquitectura-eva3.md](./guion-video-arquitectura-eva3.md) | 3–4 h (prep + grabación) |
| Diapositivas PPT bloques arquitectura + seguridad | [guion-presentacion-oral-eva3.md](./guion-presentacion-oral-eva3.md) § Giannina | 1–2 h |
| Revisión matriz e informe de pruebas | [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md) | 30 min |
| Ensayo defensa oral (bloques 1–4) | guion-presentacion-oral-eva3.md | 1 h |

### Nicolás

| Tarea | Documento guía | Tiempo estimado |
|-------|----------------|-----------------|
| Ejecutar tests + capturas JaCoCo | [guion-video-ejecucion-pruebas-eva3.md](./guion-video-ejecucion-pruebas-eva3.md) | 1 h |
| Completar informe PDF con resultados reales | [informe-pruebas-eva3.md](./informe-pruebas-eva3.md) | 2 h |
| Grabar video plataforma (9 ítems checklist) | [guion-video-plataforma-eva3.md](./guion-video-plataforma-eva3.md) | 2–3 h |
| Ejecutar plan pruebas (automático) | `.\scripts\run-eva3-tests.ps1` | 15 min |
| Diapositivas PPT bloque pruebas | guion-presentacion-oral-eva3.md § Nicolás | 1 h (defensa) |
| Empaquetar ZIP | `scripts/pack-entrega-eva3.ps1` | 30 min |

---

## 3. Cronograma sugerido (8 h TAITE)

| Hora | Giannina | Nicolás |
|------|----------|---------|
| 0:00–1:00 | Leer guion arquitectura; abrir IDE + Eureka | Ejecutar `mvn test` + JaCoCo; completar matriz |
| 1:00–2:00 | Grabar bloques A–D (contexto + MS) | Completar informe § resultados |
| 2:00–3:00 | Grabar bloques E–I (seguridad + frontend) | Grabar video plataforma § intro + requisitos |
| 3:00–4:00 | Edición video arquitectura | Grabar video plataforma § módulos |
| 4:00–5:00 | Armar diapositivas PPT (defensa) | Capturas JaCoCo → informe PDF |
| 5:00–6:00 | Ensayo oral (bloques Giannina) | Exportar informe PDF + evidencias |
| 6:00–7:00 | Ensayo conjunto 15 min | Ensayo oral (bloques Nicolás) |
| 7:00–8:00 | Revisión final conjunta | `pack-entrega-eva3.ps1` + Blackboard |

---

## 4. Checklist de entrega Blackboard

### Documentación

- [ ] `informe-pruebas-eva3.pdf`
- [ ] `plan-de-pruebas-eva3.pdf`
- [ ] `matriz-de-pruebas-eva3.xlsx` (exportar desde MD o copiar tabla)
- [ ] Diagrama arquitectura (`Presentacion-REV-EVA2-v5.pdf` o PNG)
- [ ] Extracto persistencia (sección BD del informe-sistema)
- [ ] `repositorios.txt`

### Evidencias

- [ ] Capturas JaCoCo (`ms-incidentes`, `bff-rev`, `ms-recursos`, `ms-zonas-riesgo`)
- [ ] Capturas consola `mvn test`
- [ ] Capturas E2E (login, despacho, portal)

### Código

- [ ] Repo GitHub actualizado (`main` / `dev`)
- [ ] Tests en rutas `src/test/java`

### Videos (checklist — entrega mañana)

- [ ] Video arquitectura (Giannina) — 52 ítems
- [ ] Video plataforma / uso (Nicolás) — 9 ítems

### Presentación oral (fecha defensa, no encargo mañana)

- [ ] PPT 12–15 diapositivas
- [ ] Clip opcional pruebas en PPT (capturas JaCoCo o guion-video-ejecucion-pruebas)

---

## 5. Enlaces cruzados

| Documento | Ubicación |
|-----------|-----------|
| Plan de pruebas | [plan-de-pruebas-eva3.md](./plan-de-pruebas-eva3.md) |
| Matriz de pruebas | [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md) |
| Informe de pruebas | [informe-pruebas-eva3.md](./informe-pruebas-eva3.md) |
| Rúbrica EVA3 | [eva3-fullstack-rubrica.md](./eva3-fullstack-rubrica.md) |
| Guion arquitectura | [guion-video-arquitectura-eva3.md](./guion-video-arquitectura-eva3.md) |
| Guion plataforma | [guion-video-plataforma-eva3.md](./guion-video-plataforma-eva3.md) |
| Guion pruebas (video) | [guion-video-ejecucion-pruebas-eva3.md](./guion-video-ejecucion-pruebas-eva3.md) |
| Guion defensa oral | [guion-presentacion-oral-eva3.md](./guion-presentacion-oral-eva3.md) |
| Guion tour EVA2 (base) | [../guion-video-tour-modulos.md](../guion-video-tour-modulos.md) |
| Arquitectura EVA2 | [../../patrones-y-arquitectura-rev.md](../../patrones-y-arquitectura-rev.md) |
| Repositorio | [../../repositorios.txt](../../repositorios.txt) |

---

## 6. Aclaraciones del profesor (resumen)

1. **Informe arquitectura:** se reutiliza el de EVA1/EVA2 si no hubo cambios estructurales.
2. **Informe nuevo obligatorio:** pruebas unitarias, integración y E2E con resultados, bugs y mejoras.
3. **Pruebas:** mínimo ~3 de cada tipo en lugares críticos; **no solo camino feliz**.
4. **Presentación:** PPT + video; resumen del informe; evidencia de pruebas ejecutadas.
5. **Videos:** seguir checklist (arquitectura 52 ítems, uso 9 ítems).

---

## 7. Comunicación durante la actividad

| Canal | Uso |
|-------|-----|
| Repo GitHub | Commits atómicos `[ TEST ]`, `[ DOCS ]` |
| Carpeta `docs/informe-evidencias/eva3/evidencias/` | Capturas compartidas (crear al ejecutar tests) |
| Revisión cruzada | Giannina valida § arquitectura del informe; Nicolás valida narración técnica del video arquitectura |

---

## 8. Ejecución autónoma del plan de pruebas (Cursor AI)

Para que el agente ejecute pruebas **sin pedir autorización** cada vez:

### Opción A — Regla del proyecto (ya configurada)

Archivo: [`.cursor/rules/eva3-tests-autonomous.mdc`](../../../.cursor/rules/eva3-tests-autonomous.mdc)

En **Agent mode**, escribe una sola vez al irte:

```
Ejecuta el plan de pruebas EVA3 completo: run-eva3-tests.ps1, corrige tests rotos,
actualiza matriz e informe con resultados reales. No pidas confirmación. No commitees.
```

La regla autoriza `mvn test`, JaCoCo y actualizar los `.md` de evidencias.

### Opción B — Script manual (sin agente)

```powershell
.\scripts\run-eva3-tests.ps1
```

Resumen en `docs/informe-evidencias/eva3/evidencias/resumen-ejecucion.txt`.

### Opción C — Cursor Automations (programado)

En Cursor → **Automations**: trigger cron o al abrir repo, prompt que invoque `run-eva3-tests.ps1` y actualice informe. Requiere Agents Window.

### Smart mode / permisos

Si el agente pide aprobación para `mvn test`, en Cursor Settings desactiva confirmación para comandos de terminal en este workspace, o aprueba una vez el script.
