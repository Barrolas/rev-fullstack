import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { fetchCorrelacionesPendientesCount, fetchDashboard, type DashboardItem } from '../api';
import { useUi } from '../contexts/UiContext';
import IncidentCard from '../components/IncidentCard';
import IncidenteOperacionPanel from '../components/incidentes/IncidenteOperacionPanel';
import IncidentesCorrelacionesPanel from '../components/incidentes/IncidentesCorrelacionesPanel';
import IncidentesFilters from '../components/incidentes/IncidentesFilters';
import IncidentesModuleTabs, { type IncidentesModuleView } from '../components/incidentes/IncidentesModuleTabs';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleView: IncidentesModuleView =
    searchParams.get('vista') === 'correlaciones' ? 'correlaciones' : 'listado';

  const fetchFn = useCallback(() => fetchDashboard(), []);
  const correlacionesCountFn = useCallback(() => fetchCorrelacionesPendientesCount(), []);
  const { data: items, loading, error, refetch } = useApiQuery({ fetchFn });
  const { data: correlacionesCount, refetch: refetchCorrelacionesCount } = useApiQuery({
    fetchFn: correlacionesCountFn,
  });

  const [filters, setFilters] = useState<IncidentFiltersState>(DEFAULT_INCIDENT_FILTERS);
  const [viewMode, setViewMode] = useState<IncidentViewMode>('cards');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(['CERRADO']));
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);

  const setModuleView = (view: IncidentesModuleView) => {
    if (view === 'listado') {
      setSearchParams({});
    } else {
      setSearchParams({ vista: 'correlaciones' });
    }
  };

  const refreshAll = useCallback(() => {
    refetch();
    refetchCorrelacionesCount();
  }, [refetch, refetchCorrelacionesCount]);

  useEffect(() => {
    if (incidentCreatedTick > 0) refreshAll();
  }, [incidentCreatedTick, refreshAll]);

  useEffect(() => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (filters.scopeFilter === 'activos') {
        next.add('CERRADO');
      } else {
        next.delete('CERRADO');
      }
      return next;
    });
  }, [filters.scopeFilter]);

  const list = items ?? [];
  const kpis = computeDashboardKpis(list);

  const filtered = useMemo(
    () => sortIncidents(filterIncidents(list, filters), filters.sort, filters.scopeFilter),
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
        <IncidentCard
          key={item.incidente.id}
          item={item}
          selected={selectedItem?.incidente.id === item.incidente.id}
          canOperate={canManageIncidents}
          onSelect={() =>
            setSelectedItem((current) =>
              current?.incidente.id === item.incidente.id ? null : item,
            )
          }
        />
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
      {(correlacionesCount ?? 0) > 0 && (
        <KpiCol>
          <button
            type="button"
            className="rev-incidentes-kpi-link w-100 border-0 bg-transparent p-0 text-start"
            onClick={() => setModuleView('correlaciones')}
          >
            <KpiCard
              label="Correlaciones"
              value={correlacionesCount ?? 0}
              icon="bi-intersect"
              iconVariant="warning"
              sub="Pendientes de revisión"
            />
          </button>
        </KpiCol>
      )}
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
        <Button variant="outline-secondary" size="sm" onClick={refreshAll}>
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
      onFilterEstado={(estado) => {
        if (estado === 'CERRADO') {
          patchFilters({ scopeFilter: 'cerrados', estadoFilter: 'ALL' });
        } else {
          patchFilters({
            scopeFilter: 'activos',
            estadoFilter: estado as IncidentEstadoFilter,
          });
        }
      }}
      onFilterHighRisk={() =>
        patchFilters({ riskFilter: 'HIGH', scopeFilter: 'activos', estadoFilter: 'ALL', sinRecursos: false })
      }
      onFilterSinRecursos={() =>
        patchFilters({ sinRecursos: true, scopeFilter: 'activos', estadoFilter: 'ALL' })
      }
      onFilterDegradados={() => {
        setModuleView('listado');
        patchFilters({
          degradadosOnly: true,
          scopeFilter: 'todos',
          estadoFilter: 'ALL',
          riskFilter: 'ALL',
          sinRecursos: false,
        });
      }}
      correlacionesPendientes={correlacionesCount ?? 0}
      onFilterCorrelaciones={() => setModuleView('correlaciones')}
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
            <IncidentesModuleTabs
              active={moduleView}
              correlacionesCount={correlacionesCount ?? 0}
              onChange={setModuleView}
            />

            {moduleView === 'correlaciones' ? (
              <IncidentesCorrelacionesPanel onResolved={refreshAll} />
            ) : (
              <>
                {filtersBar}

                {selectedItem && canManageIncidents && selectedItem.incidente.estado !== 'CERRADO' && (
                  <div className="rev-incidente-ops-selection rev-card">
                    <div className="rev-incidente-ops-selection__head">
                      <div>
                        <strong>Caso seleccionado</strong>
                        <span className="text-muted small ms-2">
                          {selectedItem.incidente.folio ?? selectedItem.incidente.tipo}
                        </span>
                      </div>
                      <Button variant="link" size="sm" className="p-0" onClick={() => setSelectedItem(null)}>
                        Quitar selección
                      </Button>
                    </div>
                    <IncidenteOperacionPanel
                      incidenteId={selectedItem.incidente.id}
                      incidenteEstado={selectedItem.incidente.estado}
                      incidenteFolio={selectedItem.incidente.folio}
                      canManage={canManageIncidents}
                      compact
                      onUpdated={() => {
                        refreshAll();
                        setSelectedItem(null);
                      }}
                    />
                  </div>
                )}

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
                      selectedIncidenteId={selectedItem?.incidente.id}
                      canOperate={canManageIncidents}
                      onSelectIncidente={(item) =>
                        setSelectedItem((current) =>
                          current?.incidente.id === item.incidente.id ? null : item,
                        )
                      }
                    />
                  )}
                </StateView>
              </>
            )}
          </div>
        </ModuleHub>
      </AppPage>
    </>
  );
}
