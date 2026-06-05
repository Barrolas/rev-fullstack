import type { DashboardItem } from '../api';
import { ESTADO_ORDER } from './dashboardAggregates';

export type IncidentRiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentEstadoFilter = 'ALL' | (typeof ESTADO_ORDER)[number];
export type IncidentScopeFilter = 'activos' | 'todos' | 'cerrados';
export type IncidentSort = 'priority' | 'tipo' | 'recursos';
export type IncidentViewMode = 'cards' | 'table';

export interface IncidentFiltersState {
  search: string;
  riskFilter: IncidentRiskFilter;
  estadoFilter: IncidentEstadoFilter;
  scopeFilter: IncidentScopeFilter;
  sinRecursos: boolean;
  degradadosOnly: boolean;
  correlacionPendienteOnly: boolean;
  sort: IncidentSort;
}

export const DEFAULT_INCIDENT_FILTERS: IncidentFiltersState = {
  search: '',
  riskFilter: 'ALL',
  estadoFilter: 'ALL',
  scopeFilter: 'activos',
  sinRecursos: false,
  degradadosOnly: false,
  correlacionPendienteOnly: false,
  sort: 'priority',
};

const SCOPE_OPTIONS: { value: IncidentScopeFilter; label: string }[] = [
  { value: 'activos', label: 'Activos' },
  { value: 'todos', label: 'Todos' },
  { value: 'cerrados', label: 'Cerrados' },
];

export { SCOPE_OPTIONS };

export function isIncidenteActivo(estado: string): boolean {
  return estado !== 'CERRADO';
}

export function patchScopeFilter(
  current: IncidentFiltersState,
  scopeFilter: IncidentScopeFilter,
): Partial<IncidentFiltersState> {
  const patch: Partial<IncidentFiltersState> = { scopeFilter };
  if (scopeFilter === 'activos' && current.estadoFilter === 'CERRADO') {
    patch.estadoFilter = 'ALL';
  }
  if (scopeFilter === 'cerrados') {
    patch.estadoFilter = 'ALL';
  }
  return patch;
}

const RISK_SORT: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const ESTADO_SORT: Record<string, number> = Object.fromEntries(
  ESTADO_ORDER.map((e, i) => [e, i]),
);

function matchesSearch(item: DashboardItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const { incidente } = item;
  return (
    incidente.tipo.toLowerCase().includes(q) ||
    incidente.descripcion.toLowerCase().includes(q) ||
    incidente.id.toLowerCase().includes(q) ||
    incidente.estado.toLowerCase().includes(q) ||
    (incidente.folio?.toLowerCase().includes(q) ?? false)
  );
}

export function hasPendingCorrelation(item: DashboardItem): boolean {
  return (item.incidente.sugerenciasPendientes ?? 0) > 0
    || (item.incidente.scoreMaximoPendiente ?? 0) >= 60;
}

export function isLinkedReport(item: DashboardItem): boolean {
  return item.incidente.esCanonico === false
    && !!item.incidente.incidenteCanonicoId
    && item.incidente.incidenteCanonicoId !== item.incidente.id;
}

export function filterIncidents(
  items: DashboardItem[],
  filters: IncidentFiltersState,
): DashboardItem[] {
  return items.filter((item) => {
    const estado = item.incidente.estado;
    if (filters.scopeFilter === 'activos' && !isIncidenteActivo(estado)) return false;
    if (filters.scopeFilter === 'cerrados' && estado !== 'CERRADO') return false;
    if (filters.sinRecursos && item.recursos.length > 0) return false;
    if (filters.degradadosOnly && !item.degraded) return false;
    if (filters.correlacionPendienteOnly && !hasPendingCorrelation(item)) return false;
    if (filters.estadoFilter !== 'ALL' && item.incidente.estado !== filters.estadoFilter) {
      return false;
    }
    if (filters.riskFilter !== 'ALL') {
      const nivel = item.zonaRiesgo.nivel?.toUpperCase() ?? '';
      if (nivel !== filters.riskFilter) return false;
    }
    return matchesSearch(item, filters.search.trim());
  });
}

function compareClosedLast(a: DashboardItem, b: DashboardItem): number | null {
  const closedA = a.incidente.estado === 'CERRADO';
  const closedB = b.incidente.estado === 'CERRADO';
  if (closedA === closedB) return null;
  return closedA ? 1 : -1;
}

export function sortIncidents(
  items: DashboardItem[],
  sort: IncidentSort,
  scopeFilter: IncidentScopeFilter = 'activos',
): DashboardItem[] {
  return [...items].sort((a, b) => {
    if (scopeFilter === 'todos') {
      const closedOrder = compareClosedLast(a, b);
      if (closedOrder !== null) return closedOrder;
    }
    if (sort === 'tipo') {
      return a.incidente.tipo.localeCompare(b.incidente.tipo, 'es');
    }
    if (sort === 'recursos') {
      return b.recursos.length - a.recursos.length;
    }
    const riskA = RISK_SORT[a.zonaRiesgo.nivel?.toUpperCase()] ?? 3;
    const riskB = RISK_SORT[b.zonaRiesgo.nivel?.toUpperCase()] ?? 3;
    if (riskA !== riskB) return riskA - riskB;
    const estadoA = ESTADO_SORT[a.incidente.estado] ?? 99;
    const estadoB = ESTADO_SORT[b.incidente.estado] ?? 99;
    if (estadoA !== estadoB) return estadoA - estadoB;
    if (a.degraded !== b.degraded) return a.degraded ? -1 : 1;
    return a.incidente.tipo.localeCompare(b.incidente.tipo, 'es');
  });
}

export function groupIncidentsByEstado(
  items: DashboardItem[],
): { estado: string; items: DashboardItem[] }[] {
  const groups = new Map<string, DashboardItem[]>();
  for (const item of items) {
    const estado = item.incidente.estado;
    const list = groups.get(estado) ?? [];
    list.push(item);
    groups.set(estado, list);
  }
  return ESTADO_ORDER.filter((e) => groups.has(e)).map((estado) => ({
    estado,
    items: groups.get(estado)!,
  }));
}

export function hasActiveIncidentFilters(filters: IncidentFiltersState): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.riskFilter !== 'ALL' ||
    filters.estadoFilter !== 'ALL' ||
    filters.scopeFilter !== 'activos' ||
    filters.sinRecursos ||
    filters.degradadosOnly ||
    filters.correlacionPendienteOnly ||
    filters.sort !== 'priority'
  );
}

export function isHighPriorityIncident(item: DashboardItem): boolean {
  return (
    item.zonaRiesgo.nivel === 'HIGH' &&
    item.incidente.estado !== 'CERRADO'
  );
}

export interface EstadoVisual {
  slug: string;
  variant: string;
  icon: string;
}

export function getEstadoVisual(estado: string): EstadoVisual {
  switch (estado) {
    case 'ESCALADO':
      return { slug: 'escalado', variant: 'danger', icon: 'bi-exclamation-octagon' };
    case 'EN_PROGRESO':
      return { slug: 'en-progreso', variant: 'warning', icon: 'bi-arrow-repeat' };
    case 'REPORTADO':
      return { slug: 'reportado', variant: 'info', icon: 'bi-broadcast' };
    case 'CONTROLADO':
      return { slug: 'controlado', variant: 'success', icon: 'bi-check-circle' };
    case 'CERRADO':
      return { slug: 'cerrado', variant: 'secondary', icon: 'bi-archive' };
    default:
      return { slug: 'otro', variant: 'light', icon: 'bi-circle' };
  }
}
