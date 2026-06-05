# Flujo de despacho y organización de recursos — REV

## Territorio

- **Región:** Metropolitana (código CASEN **13**) — constante en configuración, sin tabla `regiones`.
- **Provincia en catálogo:** Cordillera (`provincias.codigo_casen = 132`).
- **Comunas cargadas:** según [casen_cordillera_seed.sql](data/territorial/casen_cordillera_seed.sql) (CASEN 2024 CUT): Puente Alto, Pirque, San José de Maipo.
- Demo operativa REV: comuna **Puente Alto** (`13201`).

Propiedades:

```properties
rev.territorio.region-codigo-casen=13
rev.territorio.region-nombre=Región Metropolitana de Santiago
```

## Jerarquía organizacional

```text
INSTITUCION (BOMBEROS | CONAF | MUNICIPAL)
  └── COMPANIA (compañía / base; id_comuna)
        └── BRIGADA (dotación operativa)
              ├── BRIGADISTA (id_brigada, id_rol_brigadista)
              ├── BRIGADA_VEHICULO (N vehículos; uno principal)
              └── BRIGADA_HERRAMIENTA (kit)
```

## Roles en brigada (`brigadista_roles`)

| codigo | Uso |
|--------|-----|
| JEFE | Uno por brigada; `brigadas.id_jefe_brigadista` |
| CONDUCTOR | Operación vehículo |
| COMBATIENTE | Línea |
| APOYO | Logística / apoyo |

## Brigada lista para despacho

1. Tiene `id_jefe_brigadista` válido (mismo `id_brigada`, rol JEFE).
2. Integrantes activos ≤ `brigada.capacidad`.
3. Al menos un vehículo en `brigada_vehiculos` con `activa = true`.
4. Al despachar: integrantes ≤ `vehiculo.capacidad_pasajeros` del vehículo elegido.

## Despacho a incidente

1. Despachador abre **Despacho operativo** → cola de incidentes sin brigada / prioritarios.
2. Selecciona incidente → ve contexto (zona, riesgo, correlación).
3. Elige brigada elegible y **vehículo** (si hay varios).
4. `POST /api/recursos/asignar` → `ASIGNACION` + snapshot brigadistas/herramientas.
5. Seguimiento en pestaña **Activos**; liberar al cerrar.

## Vehículos

- Dotación habitual: `brigada_vehiculos` (varios por brigada, flag `principal`).
- Despacho: `asignaciones.id_vehiculo` (snapshot del vehículo que salió).

## Referencias

- [estandares-gis-despacho-rev.md](estandares-gis-despacho-rev.md)
- [guia-entorno-local.md](guia-entorno-local.md)
