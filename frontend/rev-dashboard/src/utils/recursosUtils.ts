import type { RecursosCatalogo, RecursosDisponibles } from '../api';

export type RecursoAvailabilityFilter = 'ALL' | 'DISPONIBLE' | 'ASIGNADO';
export type RecursoTab = 'brigadas' | 'brigadistas' | 'vehiculos' | 'herramientas';

export interface RecursosFiltersState {
  search: string;
  availability: RecursoAvailabilityFilter;
  lowStockOnly: boolean;
}

export const DEFAULT_RECURSOS_FILTERS: RecursosFiltersState = {
  search: '',
  availability: 'ALL',
  lowStockOnly: false,
};

export function recursoEstadoVariant(estado: string): 'secondary' | 'danger' {
  return estado.toUpperCase() === 'DISPONIBLE' ? 'secondary' : 'danger';
}

export function recursoStockLabel(level: ReturnType<typeof herramientaStockLevel>): string {
  switch (level) {
    case 'ok': return 'Disponible';
    case 'low': return 'Stock bajo';
    case 'critical':
    case 'empty':
      return 'Crítico';
  }
}

export function formatRecursoEstado(estado: string): string {
  return estado.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function computeRecursosStats(data: RecursosDisponibles | RecursosCatalogo) {
  const brigadasDisp = data.brigadas.filter((b) => b.estado === 'DISPONIBLE').length;
  const vehiculosDisp = data.vehiculos.filter((v) => v.estado === 'DISPONIBLE').length;
  const herramientasBajas = data.herramientas.filter(
    (h) => h.cantidadTotal > 0 && h.cantidadDisponible / h.cantidadTotal < 0.3,
  ).length;
  const herramientasDisp = data.herramientas.reduce((sum, h) => sum + h.cantidadDisponible, 0);
  const herramientasTotal = data.herramientas.reduce((sum, h) => sum + h.cantidadTotal, 0);

  return {
    brigadasTotal: data.brigadas.length,
    brigadasDisp,
    brigadasAsignadas: data.brigadas.length - brigadasDisp,
    vehiculosTotal: data.vehiculos.length,
    vehiculosDisp,
    vehiculosAsignados: data.vehiculos.length - vehiculosDisp,
    herramientasTipos: data.herramientas.length,
    herramientasDisp,
    herramientasTotal,
    herramientasBajas,
    disponiblesTotal: brigadasDisp + vehiculosDisp,
    enUsoTotal: data.brigadas.filter((b) => b.estado === 'ASIGNADO').length
      + data.vehiculos.filter((v) => v.estado === 'ASIGNADO').length,
    brigadistasTotal: 'brigadistas' in data ? data.brigadistas.length : 0,
    brigadistasDisp:
      'brigadistas' in data
        ? data.brigadistas.filter((b) => b.estado === 'DISPONIBLE').length
        : 0,
  };
}

export function herramientaStockLevel(
  disponible: number,
  total: number,
): 'ok' | 'low' | 'critical' | 'empty' {
  if (total <= 0) return 'empty';
  const ratio = disponible / total;
  if (disponible === 0) return 'critical';
  if (ratio < 0.3) return 'low';
  return 'ok';
}

function matchesSearch(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function filterBrigadas(
  brigadas: RecursosDisponibles['brigadas'],
  filters: RecursosFiltersState,
) {
  const q = filters.search.trim();
  return brigadas
    .filter((b) => {
      if (filters.availability !== 'ALL' && b.estado !== filters.availability) return false;
      if (!q) return true;
      return matchesSearch(b.nombre, q) || matchesSearch(b.estado, q);
    })
    .sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'DISPONIBLE' ? -1 : 1;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
}

export function filterVehiculos(
  vehiculos: RecursosDisponibles['vehiculos'],
  filters: RecursosFiltersState,
) {
  const q = filters.search.trim();
  return vehiculos
    .filter((v) => {
      if (filters.availability !== 'ALL' && v.estado !== filters.availability) return false;
      if (!q) return true;
      return (
        matchesSearch(v.patente, q) ||
        matchesSearch(v.tipo, q) ||
        matchesSearch(v.estado, q)
      );
    })
    .sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'DISPONIBLE' ? -1 : 1;
      return a.patente.localeCompare(b.patente, 'es');
    });
}

export function filterBrigadistas(
  brigadistas: RecursosCatalogo['brigadistas'],
  filters: RecursosFiltersState,
  brigadas: RecursosDisponibles['brigadas'],
) {
  const q = filters.search.trim();
  const brigadaNombre = (id?: number) =>
    id != null ? brigadas.find((b) => b.id === id)?.nombre : undefined;
  return brigadistas
    .filter((b) => {
      if (filters.availability !== 'ALL' && b.estado !== filters.availability) return false;
      if (!q) return true;
      const brigada = brigadaNombre(b.idBrigada);
      return (
        matchesSearch(`${b.nombre} ${b.apellido}`, q) ||
        matchesSearch(b.especialidad ?? '', q) ||
        matchesSearch(b.estado, q) ||
        matchesSearch(b.rolNombre ?? '', q) ||
        (brigada != null && matchesSearch(brigada, q))
      );
    })
    .sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'),
    );
}

export interface BrigadistaGrupo {
  brigadaId: number | null;
  brigadaNombre: string;
  brigadaCodigo?: string;
  brigadistas: RecursosCatalogo['brigadistas'];
}

/** Agrupa brigadistas por brigada de pertenencia (sin asignar al final). */
export function groupBrigadistasByBrigada(
  brigadistas: RecursosCatalogo['brigadistas'],
  brigadas: RecursosDisponibles['brigadas'],
  prioritizedBrigadaId?: number | null,
): BrigadistaGrupo[] {
  const brigadaMap = new Map(brigadas.map((b) => [b.id, b]));
  const byBrigada = new Map<number | null, RecursosCatalogo['brigadistas']>();

  for (const b of brigadistas) {
    const key = b.idBrigada ?? null;
    const list = byBrigada.get(key);
    if (list) list.push(b);
    else byBrigada.set(key, [b]);
  }

  const groups: BrigadistaGrupo[] = [];
  for (const [id, list] of byBrigada) {
    const brigada = id != null ? brigadaMap.get(id) : undefined;
    groups.push({
      brigadaId: id,
      brigadaNombre: brigada?.nombre ?? 'Sin asignar',
      brigadaCodigo: brigada?.codigo,
      brigadistas: [...list].sort((a, b) =>
        `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'),
      ),
    });
  }

  return groups.sort((a, b) => {
    if (prioritizedBrigadaId != null) {
      if (a.brigadaId === prioritizedBrigadaId) return -1;
      if (b.brigadaId === prioritizedBrigadaId) return 1;
    }
    if (a.brigadaId == null) return 1;
    if (b.brigadaId == null) return -1;
    return a.brigadaNombre.localeCompare(b.brigadaNombre, 'es');
  });
}

export function filterHerramientas(
  herramientas: RecursosDisponibles['herramientas'],
  filters: RecursosFiltersState,
) {
  const q = filters.search.trim();
  return herramientas
    .filter((h) => {
      const level = herramientaStockLevel(h.cantidadDisponible, h.cantidadTotal);
      if (filters.lowStockOnly && level === 'ok') return false;
      if (filters.availability === 'DISPONIBLE' && h.cantidadDisponible === 0) return false;
      if (filters.availability === 'ASIGNADO' && h.cantidadDisponible >= h.cantidadTotal) {
        return false;
      }
      if (!q) return true;
      return matchesSearch(h.nombre, q);
    })
    .sort((a, b) => {
      const ratioA = a.cantidadTotal > 0 ? a.cantidadDisponible / a.cantidadTotal : 0;
      const ratioB = b.cantidadTotal > 0 ? b.cantidadDisponible / b.cantidadTotal : 0;
      return ratioA - ratioB || a.nombre.localeCompare(b.nombre, 'es');
    });
}

export function hasActiveRecursosFilters(filters: RecursosFiltersState): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.availability !== 'ALL' ||
    filters.lowStockOnly
  );
}

export function countFilteredRecursos(
  data: RecursosCatalogo,
  filters: RecursosFiltersState,
): number {
  return (
    filterBrigadas(data.brigadas, filters).length +
    filterBrigadistas(data.brigadistas, filters, data.brigadas).length +
    filterVehiculos(data.vehiculos, filters).length +
    filterHerramientas(data.herramientas, filters).length
  );
}

export function countTotalRecursos(data: RecursosCatalogo): number {
  return (
    data.brigadas.length +
    data.brigadistas.length +
    data.vehiculos.length +
    data.herramientas.length
  );
}
