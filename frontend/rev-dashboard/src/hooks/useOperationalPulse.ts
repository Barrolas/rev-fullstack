import { useCallback, useMemo } from 'react';

import { fetchDashboard } from '../api';
import { computeDashboardKpis } from '../utils/dashboardAggregates';
import { useApiQuery } from './useApiQuery';

export function useOperationalPulse() {
  const fetchFn = useCallback(() => fetchDashboard(), []);
  const { data, loading, error } = useApiQuery({ fetchFn });
  const kpis = useMemo(() => computeDashboardKpis(data ?? []), [data]);

  return {
    loading,
    offline: !!error,
    activos: kpis.activos,
    altoRiesgo: kpis.altoRiesgo,
    degradados: kpis.degradados,
    total: kpis.total,
  };
}
