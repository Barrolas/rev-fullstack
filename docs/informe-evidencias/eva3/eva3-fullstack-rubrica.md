# Evaluación Parcial N°3 — Integración de arquitectura de microservicios

**Asignatura:** DSY1106 — Desarrollo Fullstack III  
**Tiempo:** 8 horas · **Ponderación:** 30 % encargo + 70 % defensa oral  
**Proyecto REV:** Nicolás Barra · Giannina Guerrero · Sección 306-V

---

## 1. Situación evaluativa

| Tipo | Aplica |
|------|--------|
| Ejecución práctica | Sí |
| Entrega de encargo | Sí |
| Presentación / defensa oral | Sí (15 min, calificación **individual**) |

---

## 2. Entregables oficiales (PDF EVA3)

| Documento | Descripción |
|-----------|-------------|
| Diagrama de arquitectura | PNG/PDF: frontend, backend, API REST, persistencia |
| Descripción de persistencia | JPA, Flyway, database-per-service |
| **Informe de pruebas unitarias** | Cobertura, métricas JaCoCo, ejemplos y resultados |
| Código frontend | NPM, `package.json`, README |
| Código backend | MS + BFF, `application.properties`, README |
| API REST | Swagger o Postman Collection |
| Reportes cobertura | HTML/PDF JaCoCo |
| `repositorios.txt` | Enlaces GitHub |

### Aclaración docente (EVA3)

- Informe de **arquitectura EVA2 se reutiliza** si no hubo cambios.
- Informe **nuevo obligatorio**: pruebas unitarias + integración + E2E.
- Presentación: **PPT + video** con evidencia de pruebas.
- Mínimo ~**3 unitarias + 3 integración + 3 E2E** en críticos.
- Pruebas **no solo camino feliz** (bugs, vulnerabilidades, uso incorrecto).

---

## 3. Rúbrica — Encargo grupal (30 %)

| Ind. | Ponderación | Descripción | Evidencia REV |
|------|-------------|-------------|---------------|
| 1 | 5 % | Propuesta microservicios: BFF + MS, problemática | BFF + 3 MS; [patrones-y-arquitectura-rev.md](../../patrones-y-arquitectura-rev.md) |
| 2 | 10 % | Frontend moderno + backend multi-lenguaje | React/Vite/TS + Spring Boot 4 |
| 3 | 5 % | Integración REST + persistencia JPA | Gateway → BFF → MS; Flyway + PostgreSQL |
| 4 | 10 % | Pruebas unitarias ≥ 60 % + patrones | JaCoCo; Factory, Facade, Adapter |

---

## 4. Rúbrica — Defensa oral individual (70 %)

| Ind. | Ponderación | Descripción | Quién prepara |
|------|-------------|-------------|-----------------|
| 5 | 15 % | Ideación y justificación microservicios | Giannina (video arq. §1–2) |
| 6 | 20 % | Dominio tecnologías e integración | Giannina + Nicolás |
| 7 | 15 % | Demostración integración FE/BE, escalabilidad | Nicolás (video plataforma) |
| 8 | 20 % | Pruebas unitarias, cobertura, patrones y calidad | Nicolás (video pruebas + informe) |

---

## 5. Checklist — Video de Arquitectura (52 ítems)

Referencia completa: [guion-video-arquitectura-eva3.md](./guion-video-arquitectura-eva3.md)

| Sección | Ítems | Temas |
|---------|-------|-------|
| I. Diseño global | 1–4 | Problemática, DDD, componentes, diagrama |
| Service Discovery | 5–11 | Eureka, self-registration, arranque |
| Microservicios | 12–30 | Dominio, reglas, validaciones, patrones, tests, logs, métricas |
| Seguridad | 31–35 | JWT generación, config, validación, enrutamiento |
| API Gateway | 36–38 | Funcionamiento, componentes, filtros |
| Monitoreo | 39–42 | SBA, fallos, acciones |
| Frontend | 43–52 | React/TS, reglas, errores, excepciones |

---

## 6. Checklist — Video de Uso (9 ítems)

Referencia completa: [guion-video-plataforma-eva3.md](./guion-video-plataforma-eva3.md)

| # | Ítem |
|---|------|
| 1 | Problemática y solución |
| 2 | Introducción de la solución |
| 3 | Requisitos del sistema |
| 4 | Instalación y configuración |
| 5 | Acceso al sistema |
| 6 | Descripción de la interfaz |
| 7 | Funcionalidades principales |
| 8 | Toda la funcionalidad del sistema |
| 9 | Conclusión y escalabilidad |

---

## 7. Mapa documentación EVA3

| Documento | Archivo |
|-----------|---------|
| Instrucciones equipo | [instrucciones-equipo-eva3.md](./instrucciones-equipo-eva3.md) |
| Plan de pruebas | [plan-de-pruebas-eva3.md](./plan-de-pruebas-eva3.md) |
| Matriz de pruebas | [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md) |
| Informe de pruebas | [informe-pruebas-eva3.md](./informe-pruebas-eva3.md) |
| Guion arquitectura | [guion-video-arquitectura-eva3.md](./guion-video-arquitectura-eva3.md) |
| Guion plataforma | [guion-video-plataforma-eva3.md](./guion-video-plataforma-eva3.md) |
| Guion pruebas | [guion-video-ejecucion-pruebas-eva3.md](./guion-video-ejecucion-pruebas-eva3.md) |
| Guion defensa | [guion-presentacion-oral-eva3.md](./guion-presentacion-oral-eva3.md) |
