# Guion video plataforma (uso) — EVA3 REV

| Campo | Valor |
|-------|-------|
| **Responsable grabación** | Nicolás Barra |
| **Formato** | Pantalla + voz en off |
| **Duración objetivo** | 8–10 minutos |
| **Checklist** | 9 ítems — Video de Uso |
| **Base** | [guion-video-tour-modulos.md](../guion-video-tour-modulos.md) ampliado |

> Preparación técnica y datos demo: ver §2–§4 del [guion tour EVA2](../guion-video-tour-modulos.md).  
> Reset recomendado: `.\scripts\reset-operacion-despacho.ps1 -ResetVolumes`

---

## Mapa checklist → bloques

| # Checklist | Bloque guion | Tiempo |
|-------------|--------------|--------|
| 1 | A — Problemática y solución | 0:00–0:45 |
| 2 | A — Introducción REV | 0:45–1:15 |
| 3 | B — Requisitos del sistema | 1:15–1:45 |
| 4 | B — Instalación y configuración | 1:45–2:15 |
| 5 | B — Acceso al sistema | 2:15–2:45 |
| 6 | C — Descripción de interfaz | 2:45–3:30 |
| 7–8 | D–K — Funcionalidades (tour módulos) | 3:30–8:30 |
| 9 | L — Conclusión y escalabilidad | 8:30–9:30 |

---

## Bloque A — Problemática e introducción (ítems 1–2)

### Ítem 1 · Problemática y cómo entrega solución

**Pantalla:** Portal `/portal` landing (antes de login) o diapositiva problema

**Narración:**
«Valle del Sol necesita coordinar emergencias forestales, urbanas y alertas vecinales en los primeros quince minutos críticos. REV — Red de Emergencia Valle — entrega una plataforma unificada: el ciudadano reporta sin cuenta, el despachador prioriza en un mapa territorial, asigna brigadas y agrupa alertas duplicadas. La solución reduce tiempo de respuesta y mantiene operación parcial aunque falle un servicio secundario.»

---

### Ítem 2 · Introducción de la solución

**Pantalla:** Logo REV + menú lateral tras login (preview rápido) o portal + despacho en split mental

**Narración:**
«REV integra cinco módulos operativos: Inicio con KPIs, Despacho unificado, Incidentes con correlaciones, Zonas de riesgo PostGIS y Recursos logísticos. Detrás hay microservicios Spring Cloud, API Gateway con JWT y un portal público 24/7. Lema del proyecto: *Conectividad que salva vidas*.»

---

## Bloque B — Requisitos, instalación y acceso (ítems 3–5)

### Ítem 3 · Requisitos del sistema

**Pantalla:** Lista en pantalla (Notepad o slide simple) — no grabar instalación real

**Narración:**
«Requisitos para ejecutar REV en taller:

- **Docker Desktop** — bases PostgreSQL, Keycloak, microservicios contenedorizados.
- **Java 21** — compilación Maven de JARs.
- **Node.js 18+** — frontend Vite en desarrollo.
- **Navegador Chrome/Edge** moderno.
- **PowerShell 5.1+** — scripts de arranque en `scripts/`.
- **8 GB RAM** mínimo recomendado para stack completo.»

---

### Ítem 4 · Instalación y configuración

**Pantalla:** Terminal con comando visible (ejecutar antes o mostrar historial)

**Narración:**
«Clonamos el repositorio desde GitHub — enlace en `docs/repositorios.txt`. Desde la raíz del monorepo ejecutamos:

`.\scripts\dev-up.ps1 -DockerApps -Build`

Ese script compila los JARs, levanta Docker Compose con PostgreSQL, Eureka, Gateway, BFF, tres microservicios, Keycloak y arranca Vite en el frontend. La configuración por ambiente está en `application.properties` y variables Docker — no requiere editar código para la demo.»

---

### Ítem 5 · Cómo acceder al sistema

**Pantalla:** Navegador con URLs

**Narración:**
«Accesos principales:

| Rol | URL | Credenciales demo |
|-----|-----|-------------------|
| Despachador | http://localhost:15173/login | `despachador` / `rev123` |
| Portal ciudadano | http://localhost:15173/portal | Sin login |
| API Gateway | http://localhost:18080 | JWT tras login |
| Eureka | http://localhost:18761 | Monitoreo interno |
| Spring Boot Admin | http://localhost:18099 | Health servicios |

El puerto 15173 es Vite en desarrollo; en producción iría detrás de nginx.»

---

## Bloque C — Descripción de interfaz (ítem 6)

**Pantalla:** Login → `/inicio` (sesión despachador)

**Narración:**
«La interfaz operativa sigue un layout consistente:

- **Sidebar izquierdo** — navegación entre módulos; iconos Bootstrap Icons.
- **Barra superior** — usuario, rol y cierre de sesión.
- **Área central** — KPIs en Inicio: total incidentes, activos, alto riesgo, correlaciones pendientes.
- **Mapa lateral** — Leaflet con marcadores georreferenciados.
- **Listados** — tarjetas con folio, tipo, estado y acciones rápidas (Ubicar, Detalle).
- **Despacho** — pestañas Cola / Activos / Asistente; barra de acciones contextual.
- **Feedback** — toasts, spinners de carga, alerta `DegradedAlert` si un servicio no responde.

Todo en **español**, tipografía legible para uso bajo estrés operacional.»

---

## Bloque D — Login + inicio (ítem 7 — inicio funcionalidades)

**Ruta:** `/login` → `/inicio`  
**Tiempo:** 3:30 – 4:10

| Acción | Narración |
|--------|-----------|
| Login `despachador` / `rev123` | «Ingresamos al panel operativo municipal.» |
| KPIs en inicio | «El turno se resume en indicadores: cuántas emergencias, cuáles activas, alertas de correlación.» |
| Sidebar | «Cinco módulos integrados en una sola SPA React.» |
| Listado + mapa | «Los casos prioritarios aparecen con georreferenciación inmediata.» |

*(Detalle completo: [guion tour § Bloque 1](../guion-video-tour-modulos.md))*

---

## Bloque E — Mapa + detalle incidente (ítem 8)

**Ruta:** `/inicio` → detalle incidente A (*Humo cordillera — contexto demo REV*)  
**Tiempo:** 4:10 – 4:50

| Acción | Narración |
|--------|-----------|
| Ubicar en mapa | «Cada incidente se localiza territorialmente sin cambiar de módulo.» |
| Abrir detalle | «La ficha consolida folio, estado, tipo, coordenadas y riesgo de zona.» |

---

## Bloque F — Despacho operativo (ítem 8) ⭐

**Ruta:** `/despacho/operacion`  
**Tiempo:** 4:50 – 5:50

| Acción | Narración |
|--------|-----------|
| Cola → seleccionar incidente A | «Despacho unificado: cola pendiente y activos en terreno.» |
| Asignar MUN-REFUERZO → Despacho rápido | «Asignamos brigada disponible con dotación completa.» |
| Pestaña Activos | «El incidente pasa a activos con brigada en camino.» |

> Este bloque cubre **E2E-01** de la matriz de pruebas.

---

## Bloque G — Portal ciudadano en vivo (ítem 8) ⭐

**Ruta:** Incógnito `/portal#reportar`  
**Tiempo:** 5:50 – 6:35

| Acción | Narración |
|--------|-----------|
| Formulario reporte en vivo | «Canal público sin registro — el vecino georreferencia la alerta.» |
| Enviar → folio | «El sistema genera folio y encola para despacho.» |

---

## Bloque H — Reporte en cola despacho (ítem 8)

**Ruta:** `/despacho/operacion`  
**Tiempo:** 6:35 – 6:55

| Acción | Narración |
|--------|-----------|
| Ver nuevo incidente en cola | «El operador recibe la alerta ciudadana en tiempo real — integración frontend-BFF-microservicios.» |

> Cubre **E2E-02** matriz.

---

## Bloque I — Incidentes y correlaciones (ítem 8)

**Ruta:** `/incidentes`  
**Tiempo:** 6:55 – 7:35

| Acción | Narración |
|--------|-----------|
| Nuevo incidente (modal 5 s) | «Registro manual interno complementa el portal.» |
| Correlaciones → Pendientes | «Sugerencias de agrupación geo-temporal — operador confirma o descarta.» |
| Mencionar Confirmadas/Descartadas | «Historial de decisiones de correlación.» |

---

## Bloque J — Zonas y recursos (ítem 8)

**Rutas:** `/zonas` → `/recursos`  
**Tiempo:** 7:35 – 8:10

| Acción | Narración |
|--------|-----------|
| Mapa territorial zonas | «PostGIS cruza incidentes con niveles de riesgo municipal.» |
| Inventario brigadas | «Estado real de dotación: disponible, asignada, en mantención.» |

---

## Bloque K — Spring Boot Admin (ítem 8 — infra visible)

**URL:** http://localhost:18099  
**Tiempo:** 8:10 – 8:30

| Acción | Narración |
|--------|-----------|
| Wallboard apps UP | «Microservicios registrados en Eureka — salud centralizada.» |

---

## Bloque L — Conclusión y escalabilidad (ítem 9)

**Pantalla:** `/inicio` o slide cierre

**Narración:**
«Concluimos el recorrido por REV. Demostramos el flujo completo: ciudadano reporta, despachador asigna, territorio contextualiza riesgo y recursos ejecutan la respuesta.

**Escalabilidad:** cada dominio — incidentes, zonas, recursos — es un microservicio independiente con base de datos propia. Podemos escalar réplicas de ms-incidentes en temporada de incendios sin redesplegar recursos. Eureka balancea carga; el Gateway centraliza seguridad; el BFF agrega datos reduciendo round-trips al frontend.

**Evolución:** separación reportes/incidentes v2, tests automatizados frontend, despliegue Kubernetes municipal.

REV — *Conectividad que salva vidas*. Gracias.»

---

## Datos demo — referencia rápida

Ver [guion tour §3](../guion-video-tour-modulos.md):

| Reporte | Descripción | Uso en video |
|---------|-------------|--------------|
| A | Humo cordillera — contexto demo REV | Mapa, detalle, despacho en vivo |
| B | Humo residencial — contexto demo REV | Pre-asignado (Activos) |
| C | Segundo aviso mismo sector | Correlación pendiente |
| D | Alerta ciudadana en vivo | Portal durante grabación |

**Pre-asignación previa:** B con MUN-RAPIDA (fuera de cámara).

---

## Checklist final Nicolás

- [ ] Ítem 1 — Problemática y solución
- [ ] Ítem 2 — Introducción REV
- [ ] Ítem 3 — Requisitos listados
- [ ] Ítem 4 — Instalación mencionada (`dev-up.ps1`)
- [ ] Ítem 5 — URLs y credenciales
- [ ] Ítem 6 — Layout UI explicado
- [ ] Ítem 7 — Funcionalidades principales nombradas
- [ ] Ítem 8 — Tour completo módulos
- [ ] Ítem 9 — Cierre + escalabilidad
- [ ] Duración 8–10 min
- [ ] 1080p, audio claro

---

## Contingencias

Ver [guion tour §7](../guion-video-tour-modulos.md). Prioridad: **nunca cortar** portal → despacho en vivo.

---

## Archivo sugerido

`REV-video-plataforma-eva3.mp4`

---

## Referencias

- Matriz E2E: [matriz-de-pruebas-eva3.md](./matriz-de-pruebas-eva3.md)
- Informe: [informe-pruebas-eva3.md](./informe-pruebas-eva3.md)
- Guion arquitectura (Giannina): [guion-video-arquitectura-eva3.md](./guion-video-arquitectura-eva3.md)
