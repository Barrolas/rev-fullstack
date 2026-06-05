import { useCallback, useMemo } from 'react';
import { fetchDashboard } from '../api';
import PrincipalIncidentesPanel from '../components/dashboard/PrincipalIncidentesPanel';
import InicioAbout from '../components/inicio/InicioAbout';
import InicioGuide from '../components/inicio/InicioGuide';
import InicioPanorama from '../components/inicio/InicioPanorama';
import InicioPriority from '../components/inicio/InicioPriority';
import InicioQuickAccess from '../components/inicio/InicioQuickAccess';
import InicioWelcome from '../components/inicio/InicioWelcome';
import AppPage from '../components/layout/AppPage';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import { useAuth } from '../hooks/useAuth';
import { computeDashboardKpis } from '../utils/dashboardAggregates';

export default function InicioPage() {
  const { displayName, role } = useAuth();
  const fetchFn = useCallback(() => fetchDashboard(), []);
  const { data: items, loading, error, refetch } = useApiQuery({ fetchFn });
  const kpis = computeDashboardKpis(items ?? []);
  const viewState = loading ? 'loading' : error ? 'error' : 'idle';

  const welcomeKpis = useMemo(
    () => ({
      activos: kpis.activos,
      altoRiesgo: kpis.altoRiesgo,
      degradados: kpis.degradados,
      total: kpis.total,
    }),
    [kpis],
  );

  return (
    <>
      <Topbar
        title="Inicio"
        subtitle="Bienvenido al despacho REV"
        breadcrumbs={[{ label: 'Inicio' }]}
      />
      <AppPage>
        <StateView state={viewState} errorMessage={error} onRetry={refetch}>
          <div className="rev-inicio">
            {/* Nivel 1 — Identidad + KPIs */}
            <InicioWelcome displayName={displayName} role={role} kpis={welcomeKpis} />

            {/* Nivel 2 — Operaciones: principal + rail contextual */}
            <div className="rev-inicio__workspace">
              <div className="rev-inicio__main">
                {items && (
                  <PrincipalIncidentesPanel
                    items={items}
                    variant="inicio"
                    className="rev-card"
                  />
                )}
                {items && <InicioPanorama items={items} />}
                <InicioQuickAccess />
              </div>
              <aside className="rev-inicio__rail">
                {items && <InicioPriority items={items} />}
                <InicioGuide />
              </aside>
            </div>

            {/* Nivel 3 — Referencia institucional */}
            <InicioAbout />
          </div>
        </StateView>
      </AppPage>
    </>
  );
}
