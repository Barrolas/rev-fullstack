import { useCallback, useEffect } from 'react';
import { Button, Row } from 'react-bootstrap';
import { fetchDashboard } from '../api';
import { useUi } from '../contexts/UiContext';
import IncidentCard from '../components/IncidentCard';
import AppPage from '../components/layout/AppPage';
import ModuleHub, { KpiCol, KpiRow } from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import KpiCard from '../components/primitives/KpiCard';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import { useAuth } from '../hooks/useAuth';
import { computeDashboardKpis } from '../utils/dashboardAggregates';

export default function IncidentesPage() {
  const { openIncidentModal, incidentCreatedTick } = useUi();
  const { canManageIncidents } = useAuth();
  const fetchFn = useCallback(() => fetchDashboard(), []);
  const { data: items, loading, error, refetch } = useApiQuery({ fetchFn });

  useEffect(() => {
    if (incidentCreatedTick > 0) refetch();
  }, [incidentCreatedTick, refetch]);

  const list = items ?? [];
  const kpis = computeDashboardKpis(list);
  const viewState = loading ? 'loading' : error ? 'error' : list.length === 0 ? 'empty' : 'idle';

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

  const toolbar = (
    <>
      <small className="text-muted">Listado completo de incidentes registrados</small>
      <div className="rev-module-hub__toolbar-actions">
        <Button variant="outline-secondary" size="sm" onClick={refetch}>
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </Button>
        {canManageIncidents && (
          <Button variant="danger" size="sm" onClick={openIncidentModal}>
            <i className="bi bi-plus-circle me-1" />
            Nuevo incidente
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      <Topbar
        title="Incidentes"
        subtitle="Gestión y registro de emergencias"
        breadcrumbs={[{ label: 'Despacho', to: '/' }, { label: 'Incidentes' }]}
        actions={
          canManageIncidents ? (
            <Button variant="danger" size="sm" onClick={openIncidentModal}>
              <i className="bi bi-plus-lg me-1" />
              Nuevo
            </Button>
          ) : undefined
        }
      />
      <AppPage>
        <ModuleHub kpis={kpiSection} toolbar={toolbar}>
          <StateView
            state={viewState}
            errorMessage={error}
            onRetry={refetch}
            emptyTitle="Sin incidentes"
            emptyMessage="No hay incidentes registrados. Cree el primero desde el botón Nuevo incidente."
            emptyAction={
              canManageIncidents ? (
                <Button variant="danger" size="sm" onClick={openIncidentModal}>
                  Registrar incidente
                </Button>
              ) : undefined
            }
          >
            <Row>
              {list.map((item) => (
                <IncidentCard key={item.incidente.id} item={item} />
              ))}
            </Row>
          </StateView>
        </ModuleHub>
      </AppPage>
    </>
  );
}
