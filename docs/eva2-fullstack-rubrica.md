# Evaluación Parcial N°2 — Implementación de componentes Frontend y Backend

**Asignatura:** DSY1106 — Desarrollo Fullstack III  
**Tiempo asignado:** 8 horas  
**Ponderación:** 40% del curso

> Documento oficial de evaluación. Referencia para el encargo grupal y la defensa oral individual del proyecto REV.

---

## 1. Situación evaluativa

| Modalidad | Aplica |
|-----------|--------|
| Ejecución práctica | — |
| Entrega de encargo | ✓ |
| Presentación (defensa oral) | ✓ |

---

## 2. Instrucciones generales

### Descripción general

En esta evaluación, trabajarán en equipos continuando con el caso trabajado en la evaluación parcial 1. El objetivo será analizar distintos **patrones de diseño**, **arquetipos** y **patrones arquitectónicos**, con el propósito de generar componentes frontend y backend que se adapten a la necesidad del cliente, implementando **estrategias de branching**, optimizando el trabajo y colaboración en equipo, lo que permitirá generar una solución técnica alineada con las necesidades del cliente.

En esta etapa, cada equipo entregará un **Encargo**, que debe incluir:

- Componentes frontend de tipo **NPM**
- Al menos **3 componentes backend** (1 Backend For Frontend y 2 microservicios) basados en **arquetipos Maven**
- Todos los componentes versionados en **GitHub**

El encargo se evalúa de forma **grupal**.

Además, cada equipo deberá **presentar y defender** los resultados de su análisis en una exposición de **15 minutos**. Durante la defensa, **cada estudiante responderá individualmente** las preguntas planteadas por el/la docente, basadas en las actividades desarrolladas en esta Experiencia de Aprendizaje. La defensa evalúa el nivel de comprensión individual y el grado de contribución de cada integrante.

El tiempo asignado es de **8 horas**, en equipos, en Taller de alto cómputo (TAITE 9).

### Distribución de porcentajes

| Evaluación | Tipo | Ponderación en la Parcial |
|------------|------|--------------------------|
| Parcial N°2 | Encargo | 30% |
| Parcial N°2 | Defensa oral | 70% |
| **Total** | | **100%** |

### 2.1. Instrucciones del entregable

1. **Estructurar el proyecto:** componentes frontend, backend y arquetipos Maven correctamente configurados y probados.
2. **Documentar:** análisis, patrones, estrategias e instrucciones de uso.
3. **Versionar:** subir todos los componentes a GitHub en los repositorios correspondientes.
4. **Comprimir:** organizar archivos en ZIP/RAR según la estructura indicada.
5. **Enviar:** subir el archivo comprimido y enlaces a repositorios en Blackboard.

#### Formato del entregable

**Archivo comprimido (ZIP o RAR)** con componentes y documentación:

| Sección | Contenido requerido |
|---------|---------------------|
| **Documentación** | **Análisis de Patrones y Arquetipos** — PDF con patrones y arquetipos seleccionados, justificando su uso |
| | **Plan de Branching** — PDF con la estrategia de branching utilizada |
| **Frontend** | Componente NPM empaquetado; `package.json`; código en `src/`, `public/`, etc.; `README.md` con instrucciones |
| **Backend — BFF** | Código estructurado; `README.md` con instalación y ejecución |
| **Backend — Microservicios** | Código organizado; configuración y dependencias; `README.md` por microservicio |
| **Arquetipos Maven** | Código fuente; `pom.xml`; `README.md` con guía de uso para generar proyectos |
| **Repositorios** | Archivo `repositorios.txt` o PDF con enlaces GitHub: repo principal, repos por componente, breve descripción de cada uno |

### 2.2. Instrucciones defensa oral

Cada equipo presenta el trabajo en defensa oral de **15 minutos**. Cada integrante responde **individualmente** según un banco de preguntas sugeridas. La calificación es **individual** según la rúbrica, aunque la presentación sea en equipo.

---

## 3. Pauta de evaluación — Niveles de logro

| Categoría | % logro | Descripción |
|-----------|---------|-------------|
| Muy buen desempeño | 100% | Desempeño destacado; logro de todos los aspectos del indicador |
| Buen desempeño | 80% | Alto desempeño; pequeñas omisiones, dificultades o errores |
| Desempeño aceptable | 60% | Competente; logro de elementos básicos con omisiones o errores |
| Desempeño incipiente | 30% | Omisiones importantes; no evidencia elementos básicos |
| Desempeño no logrado | 0% | Ausencia o desempeño incorrecto |

---

## 3.1. Rúbrica de evaluación

### Dimensión: Encargo grupal (30%)

#### Indicador 1 — Patrones de diseño (10%)

**Implementa al menos 3 patrones de diseño en los componentes frontend y backend**, asegurando eficiencia y mantenibilidad, y **justifica la selección** según el problema que resuelven.

| Nivel | Criterio |
|-------|----------|
| 100% | Tres o más patrones con ejecución precisa; justificación detallada del problema que resuelve cada uno |
| 80% | Menos de tres patrones bien implementados; justificación sólida con margen de profundizar |
| 60% | Patrones con omisiones o errores; justificación limitada |
| 30% | Omisiones importantes; justificación insuficiente |
| 0% | No implementa o no justifica; sin entendimiento del problema |

**Referencia REV:** [patrones-y-arquitectura-rev.md](./patrones-y-arquitectura-rev.md) · [informe-sistema-rev.md §4](./informe-sistema-rev.md)

---

#### Indicador 2 — Arquetipos y patrones arquitectónicos (10%)

**Utiliza arquetipos y patrones arquitectónicos** para BFF y microservicios, con coherencia, escalabilidad y eficiencia.

| Nivel | Criterio |
|-------|----------|
| 100% | Arquetipos y patrones con coherencia total; solución escalable; justificación profunda de BFF y MS |
| 80% | Uso adecuado; justificación superficial en algunos puntos |
| 60% | Aplicación con incoherencias o falta de escalabilidad; justificación limitada |
| 30% | Omisiones importantes; afecta escalabilidad y eficiencia |
| 0% | No utiliza arquetipos/patrones adecuados o sin justificación |

**Referencia REV:** [patrones-y-arquitectura-rev.md §2–3](./patrones-y-arquitectura-rev.md) · [archetypes/rev-microservice-archetype](../archetypes/rev-microservice-archetype/README.md)

---

#### Indicador 3 — Estrategia de branching (5%)

**Implementa estrategia de branching clara**, con Git, merges, ramas y resolución de conflictos documentados.

| Nivel | Criterio |
|-------|----------|
| 100% | Estrategia clara y documentada; evidencia completa de merges, ramas y conflictos |
| 80% | Estrategia clara; pequeñas omisiones en documentación o gestión |
| 60% | Estrategia presente pero gestión o documentación limitadas |
| 30% | Omisiones importantes; conflictos mal resueltos o no documentados |
| 0% | Sin estrategia clara ni evidencia de merges/ramas/conflictos |

**Referencia REV:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

#### Indicador 4 — Buenas prácticas y pruebas (5%)

**Buenas prácticas de desarrollo**, patrones de diseño, **pruebas unitarias**, código limpio y ordenado.

| Nivel | Criterio |
|-------|----------|
| 100% | Buenas prácticas; pruebas unitarias exhaustivas; código limpio |
| 80% | Buenas prácticas adecuadas; algunas pruebas o aspectos mejorables |
| 60% | Aplicación básica; problemas en patrones o pruebas; código funcional pero no siempre limpio |
| 30% | Errores u omisiones importantes; pruebas insuficientes; código desordenado |
| 0% | Sin buenas prácticas ni pruebas; código confuso |

**Referencia REV:** tests en `ms-incidentes`, `bff-rev`; JaCoCo en módulos con lógica de negocio

---

### Dimensión: Defensa oral — calificación individual (70%)

#### Indicador 5 — Explicación de patrones de diseño (20%)

**Explica con claridad** la elección y aplicación de patrones en frontend y backend; cómo contribuyen a la solución y la mantenibilidad.

| Nivel | Criterio |
|-------|----------|
| 100% | Explicación clara y detallada; contribución precisa; impacto en mantenibilidad evidente |
| 80% | Explicación adecuada; omisiones menores en mantenibilidad |
| 60% | Aspectos básicos; justificación incompleta de contribución |
| 30% | Omisiones o errores importantes |
| 0% | No explica ni justifica |

**Referencia REV:** [patrones-y-arquitectura-rev.md §7.6 y §9](./patrones-y-arquitectura-rev.md) — guión y respuestas modelo

---

#### Indicador 6 — Arquetipos y patrones arquitectónicos (20%)

**Describe** cómo se aplicaron arquetipos y patrones arquitectónicos; justifica coherencia, escalabilidad y rendimiento.

| Nivel | Criterio |
|-------|----------|
| 100% | Descripción detallada; justificación sólida de coherencia, escalabilidad y rendimiento |
| 80% | Descripción adecuada; omisiones menores |
| 60% | Justificación limitada o incompleta |
| 30% | Omisiones o errores importantes |
| 0% | No describe ni justifica |

**Referencia REV:** [informe-sistema-rev.md §3](./informe-sistema-rev.md) · demo en vivo: Gateway → BFF → MS

---

#### Indicador 7 — Estrategia de branching (15%)

**Detalla la estrategia de branching**; cómo favoreció colaboración y control de versiones; **ejemplos de gestión de conflictos**.

| Nivel | Criterio |
|-------|----------|
| 100% | Detalle claro; colaboración y versiones explicadas; ejemplos concretos de conflictos |
| 80% | Detalle adecuado; gestión de conflictos superficial |
| 60% | Relación con colaboración limitada o confusa |
| 30% | Omisiones importantes; conflictos deficientes o inexistentes |
| 0% | No describe estrategia ni impacto en colaboración |

**Referencia REV:** [CONTRIBUTING.md](./CONTRIBUTING.md) · capturas GitHub (ramas, PR, merges)

---

#### Indicador 8 — Buenas prácticas, pruebas y cobertura (15%)

**Explica** cómo buenas prácticas y patrones resolvieron problemas; presenta **resultados de pruebas unitarias y cobertura**.

| Nivel | Criterio |
|-------|----------|
| 100% | Explicación detallada; pruebas y cobertura claras; alto nivel de calidad |
| 80% | Explicación adecuada; resultados de pruebas/cobertura con omisiones menores |
| 60% | Contribución explicada; pruebas o cobertura limitadas |
| 30% | Omisiones importantes; pruebas/cobertura insuficientes |
| 0% | No explica ni presenta resultados relevantes |

**Referencia REV:** `mvn test` + reportes JaCoCo en `target/site/jacoco/`

---

## Resumen de ponderación

| Indicador | Dimensión | Ponderación |
|-----------|-----------|-------------|
| 1. Patrones de diseño | Encargo | 10% |
| 2. Arquetipos y arquitectura | Encargo | 10% |
| 3. Branching | Encargo | 5% |
| 4. Buenas prácticas y tests | Encargo | 5% |
| 5. Explicación patrones | Defensa oral | 20% |
| 6. Arquetipos y arquitectura | Defensa oral | 20% |
| 7. Branching | Defensa oral | 15% |
| 8. Pruebas y cobertura | Defensa oral | 15% |
| **Total** | | **100%** |

---

## Checklist encargo REV (derivado de la rúbrica)

| Entregable | Estado sugerido | Ubicación en repo |
|------------|-----------------|-------------------|
| Análisis Patrones y Arquetipos (PDF) | Exportar desde MD | `docs/patrones-y-arquitectura-rev.md` |
| Plan de Branching (PDF) | Exportar desde MD | `docs/CONTRIBUTING.md` |
| Frontend NPM + README | ✓ | `frontend/rev-dashboard/` |
| BFF + README | ✓ | `infraestructuredomain/bff-rev/` |
| 2+ microservicios + README | ✓ | `businessdomain/ms-*` |
| Arquetipo Maven + README | ✓ | `archetypes/rev-microservice-archetype/` |
| `repositorios.txt` | Pendiente | `docs/repositorios.txt` |
| ZIP Blackboard | Pendiente | — |
