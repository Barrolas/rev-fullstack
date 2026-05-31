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

export function countZonasByLevel(zonas: { nivelRiesgo: string }[]) {
  return {
    total: zonas.length,
    low: zonas.filter((z) => z.nivelRiesgo === 'LOW').length,
    medium: zonas.filter((z) => z.nivelRiesgo === 'MEDIUM').length,
    high: zonas.filter((z) => z.nivelRiesgo === 'HIGH').length,
  };
}
