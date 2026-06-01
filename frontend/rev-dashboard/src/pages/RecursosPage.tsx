import { useCallback, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchRecursos } from '../api';
import RecursosFilters from '../components/recursos/RecursosFilters';
import {
  RecursosDesktopGrid,
  RecursosSummaryRail,
  RecursosTables,
} from '../components/recursos/RecursosViews';
import AppPage from '../components/layout/AppPage';
import ModuleHub, { KpiCol, KpiRow } from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import KpiCard from '../components/primitives/KpiCard';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import {
  computeRecursosStats,
  countFilteredRecursos,
  countTotalRecursos,
  DEFAULT_RECURSOS_FILTERS,
  hasActiveRecursosFilters,
  type RecursosFiltersState,
} from '../utils/recursosUtils';

export default function RecursosPage() {
  const fetchFn = useCallback(() => fetchRecursos(), []);
  const { data, loading, error, refetch } = useApiQuery({ fetchFn });
  const [filters, setFilters] = useState<RecursosFiltersState>(DEFAULT_RECURSOS_FILTERS);
  const [activeTab, setActiveTab] = useState<'brigadas' | 'vehiculos' | 'herramientas'>('brigadas');

  const stats = useMemo(() => (data ? computeRecursosStats(data) : null), [data]);
  const resultCount = data ? countFilteredRecursos(data, filters) : 0;
  const totalCount = data ? countTotalRecursos(data) : 0;

  const patchFilters = (patch: Partial<RecursosFiltersState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  const viewState = loading ? 'loading' : error ? 'error' : !data ? 'empty' : 'idle';
  const showFilteredEmpty = viewState === 'idle' && resultCount === 0;

  const kpiSection = (
    <KpiRow>
      <KpiCol>
        <KpiCard
          label="Brigadas disp."
          value={stats?.brigadasDisp ?? 0}
          icon="bi-people"
          sub={`de ${stats?.brigadasTotal ?? 0} total`}
        />
      </KpiCol>
      <KpiCol>
        <KpiCard
          label="Vehículos disp."
          value={stats?.vehiculosDisp ?? 0}
          icon="bi-truck"
          iconVariant="cyan"
          sub={`de ${stats?.vehiculosTotal ?? 0} total`}
        />
      </KpiCol>
      <KpiCol>
        <KpiCard
          label="En uso"
          value={stats?.enUsoTotal ?? 0}
          icon="bi-lightning"
          iconVariant="warning"
          sub="Brigadas + vehículos"
        />
      </KpiCol>
      <KpiCol>
        <KpiCard
          label="Stock bajo"
          value={stats?.herramientasBajas ?? 0}
          icon="bi-exclamation-triangle"
          sub="Herramientas < 30%"
        />
      </KpiCol>
    </KpiRow>
  );

  const toolbar = (
    <>
      <small className="rev-toolbar-meta">
        {resultCount} recurso{resultCount !== 1 ? 's' : ''} mostrados
      </small>
      <div className="rev-module-hub__toolbar-actions">
        <Link to="/incidentes" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-fire me-1" />
          Incidentes
        </Link>
        <Button variant="outline-secondary" size="sm" onClick={refetch}>
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </Button>
      </div>
    </>
  );

  const rail = data ? (
    <RecursosSummaryRail
      data={data}
      onFilterDisponibles={() => {
        patchFilters({ availability: 'DISPONIBLE', lowStockOnly: false });
      }}
      onFilterEnUso={() => {
        patchFilters({ availability: 'ASIGNADO', lowStockOnly: false });
        setActiveTab('brigadas');
      }}
      onFilterStockBajo={() => {
        patchFilters({ availability: 'ALL', lowStockOnly: true });
        setActiveTab('herramientas');
      }}
    />
  ) : null;

  return (
    <>
      <Topbar
        title="Recursos de emergencia"
        subtitle="Brigadas, vehículos y herramientas"
        breadcrumbs={[{ label: 'Inicio', to: '/inicio' }, { label: 'Recursos' }]}
      />
      <AppPage>
        <ModuleHub kpis={kpiSection} toolbar={toolbar} rail={rail}>
          <div className="rev-recursos-layout">
            <RecursosFilters
              filters={filters}
              resultCount={resultCount}
              totalCount={totalCount}
              onFiltersChange={patchFilters}
              onClear={() => setFilters(DEFAULT_RECURSOS_FILTERS)}
              hasActiveFilters={hasActiveRecursosFilters(filters)}
            />
            <StateView
              state={viewState}
              errorMessage={error}
              onRetry={refetch}
              emptyTitle="Sin recursos"
              emptyMessage="No hay recursos disponibles en el sistema."
            >
              {showFilteredEmpty ? (
                <div className="rev-recursos-empty-filtered rev-card">
                  <i className="bi bi-funnel" aria-hidden="true" />
                  <p>Ningún recurso coincide con los filtros aplicados.</p>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setFilters(DEFAULT_RECURSOS_FILTERS)}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                data && (
                  <>
                    <div className="rev-recursos-layout__desktop">
                      <RecursosDesktopGrid data={data} filters={filters} />
                    </div>
                    <div className="rev-recursos-layout__mobile">
                      <RecursosTables
                        data={data}
                        filters={filters}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                      />
                    </div>
                  </>
                )
              )}
            </StateView>
          </div>
        </ModuleHub>
      </AppPage>
    </>
  );
}
