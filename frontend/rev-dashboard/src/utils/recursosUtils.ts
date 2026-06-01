import type { RecursosDisponibles } from '../api';

export type RecursoAvailabilityFilter = 'ALL' | 'DISPONIBLE' | 'ASIGNADO';
export type RecursoTab = 'brigadas' | 'vehiculos' | 'herramientas';

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

export function computeRecursosStats(data: RecursosDisponibles) {
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
  data: RecursosDisponibles,
  filters: RecursosFiltersState,
): number {
  return (
    filterBrigadas(data.brigadas, filters).length +
    filterVehiculos(data.vehiculos, filters).length +
    filterHerramientas(data.herramientas, filters).length
  );
}

export function countTotalRecursos(data: RecursosDisponibles): number {
  return data.brigadas.length + data.vehiculos.length + data.herramientas.length;
}
