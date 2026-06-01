import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { fetchDashboard } from '../api';
import { useUi } from '../contexts/UiContext';
import IncidentCard from '../components/IncidentCard';
import IncidentesFilters from '../components/incidentes/IncidentesFilters';
import {
  IncidentesGroupedList,
  IncidentesSummaryRail,
} from '../components/incidentes/IncidentesViews';
import AppPage from '../components/layout/AppPage';
import ModuleHub, { KpiCol, KpiRow } from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import KpiCard from '../components/primitives/KpiCard';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import { useAuth } from '../hooks/useAuth';
import { computeDashboardKpis } from '../utils/dashboardAggregates';
import {
  DEFAULT_INCIDENT_FILTERS,
  filterIncidents,
  groupIncidentsByEstado,
  hasActiveIncidentFilters,
  sortIncidents,
  type IncidentEstadoFilter,
  type IncidentFiltersState,
  type IncidentViewMode,
} from '../utils/incidentesFilters';

export default function IncidentesPage() {
  const { openIncidentModal, incidentCreatedTick } = useUi();
  const { canManageIncidents } = useAuth();
  const fetchFn = useCallback(() => fetchDashboard(), []);
  const { data: items, loading, error, refetch } = useApiQuery({ fetchFn });

  const [filters, setFilters] = useState<IncidentFiltersState>(DEFAULT_INCIDENT_FILTERS);
  const [viewMode, setViewMode] = useState<IncidentViewMode>('cards');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(['CERRADO']));

  useEffect(() => {
    if (incidentCreatedTick > 0) refetch();
  }, [incidentCreatedTick, refetch]);

  const list = items ?? [];
  const kpis = computeDashboardKpis(list);

  const filtered = useMemo(
    () => sortIncidents(filterIncidents(list, filters), filters.sort),
    [list, filters],
  );

  const groups = useMemo(() => groupIncidentsByEstado(filtered), [filtered]);

  const patchFilters = (patch: Partial<IncidentFiltersState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  const clearFilters = () => setFilters(DEFAULT_INCIDENT_FILTERS);

  const toggleGroup = (estado: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(estado)) next.delete(estado);
      else next.add(estado);
      return next;
    });
  };

  const renderCards = (cardItems: typeof filtered) => (
    <div className="rev-incidentes-grid">
      {cardItems.map((item) => (
        <IncidentCard key={item.incidente.id} item={item} />
      ))}
    </div>
  );

  const baseViewState = loading ? 'loading' : error ? 'error' : list.length === 0 ? 'empty' : 'idle';
  const showFilteredEmpty = baseViewState === 'idle' && filtered.length === 0;

  const kpiSection = (
    <KpiRow>
      <KpiCol>
        <KpiCard label="Total incidentes" value={kpis.total} icon="bi-fire" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Activos" value={kpis.activos} icon="bi-activity" iconVariant="cyan" sub="Emergencias en curso" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Alto riesgo" value={kpis.altoRiesgo} icon="bi-exclamation-triangle" iconVariant="warning" sub="Zona de riesgo alto" />
      </KpiCol>
      <KpiCol>
        <KpiCard label="Con avisos" value={kpis.degradados} icon="bi-shield-exclamation" sub="Datos incompletos" />
      </KpiCol>
    </KpiRow>
  );

  const filtersBar = (
    <IncidentesFilters
      filters={filters}
      viewMode={viewMode}
      resultCount={filtered.length}
      totalCount={list.length}
      onFiltersChange={patchFilters}
      onViewModeChange={setViewMode}
      onClear={clearFilters}
      hasActiveFilters={hasActiveIncidentFilters(filters)}
    />
  );

  const toolbar = (
    <>
      <small className="rev-toolbar-meta">
        {filtered.length} incidente{filtered.length !== 1 ? 's' : ''} mostrados
      </small>
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

  const rail = (
    <IncidentesSummaryRail
      items={list}
      onFilterEstado={(estado) =>
        patchFilters({ estadoFilter: estado as IncidentEstadoFilter, activosOnly: false })
      }
      onFilterHighRisk={() =>
        patchFilters({ riskFilter: 'HIGH', activosOnly: true, estadoFilter: 'ALL', sinRecursos: false })
      }
      onFilterSinRecursos={() =>
        patchFilters({ sinRecursos: true, activosOnly: true, estadoFilter: 'ALL' })
      }
      onFilterDegradados={() =>
        patchFilters({
          degradadosOnly: true,
          activosOnly: false,
          estadoFilter: 'ALL',
          riskFilter: 'ALL',
          sinRecursos: false,
        })
      }
    />
  );

  return (
    <>
      <Topbar
        title="Incidentes"
        subtitle="Seguimiento de emergencias"
        breadcrumbs={[{ label: 'Inicio', to: '/inicio' }, { label: 'Incidentes' }]}
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
        <ModuleHub kpis={kpiSection} toolbar={toolbar} rail={rail}>
          <div className="rev-incidentes-layout">
            {filtersBar}
            <StateView
              state={baseViewState}
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
              {showFilteredEmpty ? (
                <div className="rev-incidentes-empty-filtered rev-card">
                  <i className="bi bi-funnel" aria-hidden="true" />
                  <p>Ningún incidente coincide con los filtros aplicados.</p>
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <IncidentesGroupedList
                  groups={groups}
                  viewMode={viewMode}
                  collapsedGroups={collapsedGroups}
                  onToggleGroup={toggleGroup}
                  renderCards={renderCards}
                />
              )}
            </StateView>
          </div>
        </ModuleHub>
      </AppPage>
    </>
  );
}
