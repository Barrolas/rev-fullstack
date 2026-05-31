import { useCallback, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api';
import { useUi } from '../contexts/UiContext';
import AppPage from '../components/layout/AppPage';
import ModuleHub, { KpiCol, KpiRow } from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import KpiCard from '../components/primitives/KpiCard';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import { computeDashboardKpis } from '../utils/dashboardAggregates';

const QUICK_LINKS = [
  { to: '/incidentes', icon: 'bi-fire', label: 'Incidentes', desc: 'Ver listado y registrar nuevos' },
  { to: '/zonas', icon: 'bi-map', label: 'Zonas de riesgo', desc: 'Territorio y niveles' },
  { to: '/recursos', icon: 'bi-truck', label: 'Recursos', desc: 'Brigadas y vehículos' },
];

export default function DashboardPage() {
  const { incidentCreatedTick } = useUi();
  const fetchFn = useCallback(() => fetchDashboard(), []);
  const { data: items, loading, error, refetch } = useApiQuery({ fetchFn });

  useEffect(() => {
    if (incidentCreatedTick > 0) refetch();
  }, [incidentCreatedTick, refetch]);

  const list = items ?? [];
  const kpis = computeDashboardKpis(list);
  const viewState = loading ? 'loading' : error ? 'error' : 'idle';

  const kpiSection = (
    <KpiRow>
      <KpiCol>
        <KpiCard label="Total incidentes" value={kpis.total} icon="bi-fire" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Activos" value={kpis.activos} icon="bi-activity" iconVariant="cyan" sub="Estado ≠ CERRADO" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Alto riesgo" value={kpis.altoRiesgo} icon="bi-exclamation-triangle" iconVariant="warning" sub="Nivel HIGH" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Modo degradado" value={kpis.degradados} icon="bi-shield-exclamation" sub="Circuit breaker activo" />
      </KpiCol>
    </KpiRow>
  );

  return (
    <>
      <Topbar
        title="Despacho de Emergencias"
        subtitle="Monitoreo operacional"
        breadcrumbs={[{ label: 'Despacho', to: '/' }]}
      />
      <AppPage>
        <ModuleHub kpis={kpiSection}>
          <StateView state={viewState} errorMessage={error} onRetry={refetch}>
            <Row className="g-3">
              {QUICK_LINKS.map((link) => (
                <Col md={4} key={link.to}>
                  <Link to={link.to} className="text-decoration-none">
                    <div className="rev-card p-4 h-100 rev-quick-link">
                      <i className={`bi ${link.icon} fs-2 text-primary mb-2 d-block`} />
                      <h2 className="h6 text-white mb-1">{link.label}</h2>
                      <p className="text-muted small mb-0">{link.desc}</p>
                      {link.to === '/incidentes' && kpis.total > 0 && (
                        <span className="badge bg-secondary mt-2">{kpis.total} registrados</span>
                      )}
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
            {kpis.activos > 0 && (
              <div className="mt-4 text-center">
                <Link to="/incidentes" className="btn btn-outline-primary btn-sm">
                  Ver {kpis.activos} incidente{kpis.activos !== 1 ? 's' : ''} activo{kpis.activos !== 1 ? 's' : ''}
                </Link>
              </div>
            )}
          </StateView>
        </ModuleHub>
      </AppPage>
    </>
  );
}
