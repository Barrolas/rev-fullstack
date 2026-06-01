import { DashboardItem } from '../api';

export function computeDashboardKpis(items: DashboardItem[]) {
  const activos = items.filter((i) => i.incidente.estado !== 'CERRADO');
  const altoRiesgo = items.filter((i) => i.zonaRiesgo.nivel === 'HIGH');
  const degradados = items.filter((i) => i.degraded);

  return {
    total: items.length,
    activos: activos.length,
    altoRiesgo: altoRiesgo.length,
    degradados: degradados.length,
  };
}

export function getActiveDashboardItems(items: DashboardItem[]): DashboardItem[] {
  return items.filter((i) => i.incidente.estado !== 'CERRADO');
}

export function getHighRiskDashboardItems(items: DashboardItem[]): DashboardItem[] {
  return items.filter((i) => i.zonaRiesgo.nivel === 'HIGH' && i.incidente.estado !== 'CERRADO');
}

export function countIncidentsByEstado(items: DashboardItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const estado = item.incidente.estado;
    counts[estado] = (counts[estado] ?? 0) + 1;
  }
  return counts;
}

export const ESTADO_ORDER = ['ESCALADO', 'EN_PROGRESO', 'REPORTADO', 'CONTROLADO', 'CERRADO'] as const;

export function formatEstadoLabel(estado: string): string {
  return estado.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
export function countZonasByLevel(zonas: { nivelRiesgo: string }[]) {
  return {
    total: zonas.length,
    low: zonas.filter((z) => z.nivelRiesgo === 'LOW').length,
    medium: zonas.filter((z) => z.nivelRiesgo === 'MEDIUM').length,
    high: zonas.filter((z) => z.nivelRiesgo === 'HIGH').length,
  };
}

const RISK_SORT_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function sortZonasByRisk<T extends { nivelRiesgo: string; nombre: string }>(zonas: T[]): T[] {
  return [...zonas].sort((a, b) => {
    const orderA = RISK_SORT_ORDER[a.nivelRiesgo?.toUpperCase()] ?? 3;
    const orderB = RISK_SORT_ORDER[b.nivelRiesgo?.toUpperCase()] ?? 3;
    return orderA - orderB || a.nombre.localeCompare(b.nombre, 'es');
  });
}

export function zonasRiskPercentages(counts: {
  total: number;
  low: number;
  medium: number;
  high: number;
}) {
  if (counts.total === 0) {
    return { low: 0, medium: 0, high: 0 };
  }
  return {
    low: Math.round((counts.low / counts.total) * 100),
    medium: Math.round((counts.medium / counts.total) * 100),
    high: Math.round((counts.high / counts.total) * 100),
  };
}

export function formatCoordinate(value: number): string {
  return value.toFixed(4);
}
