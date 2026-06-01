import type { Zona } from '../api';

export type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

export function filterZonas(zonas: Zona[], search: string, riskFilter: RiskFilter): Zona[] {
  const query = search.trim().toLowerCase();
  return zonas.filter((z) => {
    const matchesSearch = !query || z.nombre.toLowerCase().includes(query);
    const nivel = z.nivelRiesgo?.toUpperCase() ?? '';
    const matchesRisk = riskFilter === 'ALL' || nivel === riskFilter;
    return matchesSearch && matchesRisk;
  });
}

export function hasActiveFilters(search: string, riskFilter: RiskFilter): boolean {
  return search.trim().length > 0 || riskFilter !== 'ALL';
}
