import { useCallback, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchCorrelacionesPendientesCount, fetchDashboard, fetchRecursos, fetchZonas } from '../api';
import PrincipalIncidentesPanel from '../components/dashboard/PrincipalIncidentesPanel';
import { useUi } from '../contexts/UiContext';
import AppPage from '../components/layout/AppPage';
import ModuleHub from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import {
  computeDashboardKpis,
  countIncidentsByEstado,
  countZonasByLevel,
  ESTADO_ORDER,
  formatEstadoLabel,
} from '../utils/dashboardAggregates';

const QUICK_LINKS = [
  { to: '/incidentes', icon: 'bi-fire', label: 'Incidentes' },
  { to: '/zonas', icon: 'bi-map', label: 'Zonas' },
  { to: '/recursos', icon: 'bi-truck', label: 'Recursos' },
];

function DespachoKpiStrip({
  kpis,
  correlacionesPendientes,
}: {
  kpis: ReturnType<typeof computeDashboardKpis>;
  correlacionesPendientes: number;
}) {
  return (
    <div className="rev-despacho-kpi-strip" aria-label="Resumen operacional">
      <span className="rev-despacho-kpi"><strong>{kpis.total}</strong> total</span>
      <span className="rev-despacho-kpi rev-despacho-kpi--active"><strong>{kpis.activos}</strong> activos</span>
      <span className="rev-despacho-kpi rev-despacho-kpi--risk"><strong>{kpis.altoRiesgo}</strong> alto</span>
      <span className="rev-despacho-kpi"><strong>{kpis.degradados}</strong> avisos</span>
      {correlacionesPendientes > 0 && (
        <Link to="/incidentes?vista=correlaciones" className="rev-despacho-kpi rev-despacho-kpi--correlacion">
          <strong>{correlacionesPendientes}</strong> correlaciones
        </Link>
      )}
    </div>
  );
}

function estadoBarClass(estado: string): string {
  switch (estado) {
    case 'ESCALADO': return 'rev-despacho-estado-bar__seg--escalado';
    case 'EN_PROGRESO': return 'rev-despacho-estado-bar__seg--progreso';
    case 'REPORTADO': return 'rev-despacho-estado-bar__seg--reportado';
    case 'CONTROLADO': return 'rev-despacho-estado-bar__seg--controlado';
    default: return 'rev-despacho-estado-bar__seg--cerrado';
  }
}

export default function DashboardPage() {
  const { incidentCreatedTick } = useUi();
  const dashboardFn = useCallback(() => fetchDashboard(), []);
  const zonasFn = useCallback(() => fetchZonas(), []);
  const recursosFn = useCallback(() => fetchRecursos(), []);
  const correlacionesFn = useCallback(() => fetchCorrelacionesPendientesCount(), []);

  const { data: items, loading, error, refetch } = useApiQuery({ fetchFn: dashboardFn });
  const { data: correlacionesCount, refetch: refetchCorrelaciones } = useApiQuery({
    fetchFn: correlacionesFn,
  });
  const { data: zonas } = useApiQuery({ fetchFn: zonasFn });
  const { data: recursos } = useApiQuery({ fetchFn: recursosFn });

  useEffect(() => {
    if (incidentCreatedTick > 0) {
      refetch();
      refetchCorrelaciones();
    }
  }, [incidentCreatedTick, refetch, refetchCorrelaciones]);

  const list = items ?? [];
  const kpis = computeDashboardKpis(list);
  const porEstado = useMemo(() => countIncidentsByEstado(list), [list]);
  const zonaCounts = countZonasByLevel(zonas ?? []);
  const brigadasDisp = recursos?.brigadas.filter((b) => b.estado === 'DISPONIBLE').length ?? 0;
  const vehiculosDisp = recursos?.vehiculos.filter((v) => v.estado === 'DISPONIBLE').length ?? 0;
  const viewState = loading ? 'loading' : error ? 'error' : 'idle';

  const toolbar = (
    <div className="rev-despacho-command-bar">
      <DespachoKpiStrip kpis={kpis} correlacionesPendientes={correlacionesCount ?? 0} />
      <nav className="rev-despacho-quick-nav" aria-label="Accesos rápidos">
        {QUICK_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="rev-despacho-quick-nav__item">
            <i className={`bi ${link.icon}`} aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </nav>
      <Button variant="outline-secondary" size="sm" onClick={refetch}>
        <i className="bi bi-arrow-clockwise me-1" />
        Actualizar
      </Button>
    </div>
  );

  return (
    <>
      <Topbar
        title="Despacho de Emergencias"
        subtitle="Monitoreo operacional"
        breadcrumbs={[{ label: 'Despacho', to: '/' }]}
      />
      <AppPage>
        <ModuleHub toolbar={toolbar}>
          <StateView state={viewState} errorMessage={error} onRetry={refetch}>
            <div className="rev-despacho-shell rev-card">
              <div className="rev-despacho-shell__head">
                <div className="rev-despacho-shell__head-main">
                  <h2 className="rev-despacho-shell__title">Centro de operaciones</h2>
                  <p className="rev-despacho-shell__desc">
                    {kpis.activos} incidente{kpis.activos !== 1 ? 's' : ''} activo{kpis.activos !== 1 ? 's' : ''}
                    {kpis.degradados > 0 && ` · ${kpis.degradados} con información parcial`}
                  </p>
                </div>
                <Link to="/incidentes" className="btn btn-outline-secondary btn-sm">
                  Ver todos
                  <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                </Link>
              </div>

              {list.length > 0 && (
                <div className="rev-despacho-estado-band">
                  <span className="rev-despacho-estado-band__label">Distribución por estado</span>
                  <div className="rev-despacho-estado-bar" role="img" aria-label="Distribución por estado">
                    {ESTADO_ORDER.filter((e) => (porEstado[e] ?? 0) > 0).map((estado) => (
                      <span
                        key={estado}
                        className={`rev-despacho-estado-bar__seg ${estadoBarClass(estado)}`}
                        style={{ flex: porEstado[estado] }}
                        title={`${formatEstadoLabel(estado)}: ${porEstado[estado]}`}
                      />
                    ))}
                  </div>
                  <div className="rev-despacho-estado-legend">
                    {ESTADO_ORDER.filter((e) => (porEstado[e] ?? 0) > 0).map((estado) => (
                      <span key={estado} className="rev-despacho-estado-legend__item">
                        {formatEstadoLabel(estado)} ({porEstado[estado]})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rev-despacho-shell__body">
                <section className="rev-despacho-shell__ops">
                  <PrincipalIncidentesPanel items={list} variant="despacho" />
                </section>

                <aside className="rev-despacho-shell__intel">
                  <div className="rev-despacho-tiles">
                    <Link to="/zonas" className="rev-despacho-tile">
                      <i className="bi bi-map" aria-hidden="true" />
                      <span className="rev-despacho-tile__value">{zonaCounts.total}</span>
                      <span className="rev-despacho-tile__label">Zonas</span>
                      <span className="rev-despacho-tile__sub">{zonaCounts.high} alto riesgo</span>
                    </Link>
                    <Link to="/recursos" className="rev-despacho-tile">
                      <i className="bi bi-people" aria-hidden="true" />
                      <span className="rev-despacho-tile__value">{brigadasDisp}</span>
                      <span className="rev-despacho-tile__label">Brigadas</span>
                      <span className="rev-despacho-tile__sub">de {recursos?.brigadas.length ?? 0} disp.</span>
                    </Link>
                    <Link to="/recursos" className="rev-despacho-tile">
                      <i className="bi bi-truck" aria-hidden="true" />
                      <span className="rev-despacho-tile__value">{vehiculosDisp}</span>
                      <span className="rev-despacho-tile__label">Vehículos</span>
                      <span className="rev-despacho-tile__sub">de {recursos?.vehiculos.length ?? 0} disp.</span>
                    </Link>
                  </div>

                  {kpis.degradados > 0 && (
                    <div className="rev-despacho-shell__warn">
                      <i className="bi bi-shield-exclamation" aria-hidden="true" />
                      <span>{kpis.degradados} emergencia{kpis.degradados !== 1 ? 's' : ''} con datos incompletos</span>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </StateView>
        </ModuleHub>
      </AppPage>
    </>
  );
}
