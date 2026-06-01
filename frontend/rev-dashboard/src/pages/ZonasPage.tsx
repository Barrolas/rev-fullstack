import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { fetchZonas, type Zona } from '../api';
import AppPage from '../components/layout/AppPage';
import ModuleHub from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import RiskBadge, { riskVariant } from '../components/RiskBadge';
import ZonasFilters from '../components/zonas/ZonasFilters';
import ZonasMap from '../components/zonas/ZonasMap';
import { useApiQuery } from '../hooks/useApiQuery';
import {
  countZonasByLevel,
  sortZonasByRisk,
  zonasRiskPercentages,
} from '../utils/dashboardAggregates';
import { filterZonas, hasActiveFilters, type RiskFilter } from '../utils/zonasFilters';

function ZonasKpiStrip({ counts }: { counts: ReturnType<typeof countZonasByLevel> }) {
  return (
    <div className="rev-zones-kpi-strip" aria-label="Resumen de zonas">
      <span className="rev-zones-kpi rev-zones-kpi--total">
        <i className="bi bi-map" aria-hidden="true" />
        <strong>{counts.total}</strong> total
      </span>
      <span className="rev-zones-kpi rev-zones-kpi--high">
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        <strong>{counts.high}</strong> alto
      </span>
      <span className="rev-zones-kpi rev-zones-kpi--medium">
        <i className="bi bi-dash-circle" aria-hidden="true" />
        <strong>{counts.medium}</strong> medio
      </span>
      <span className="rev-zones-kpi rev-zones-kpi--low">
        <i className="bi bi-check-circle" aria-hidden="true" />
        <strong>{counts.low}</strong> bajo
      </span>
    </div>
  );
}

function ZonaListItem({
  zona,
  selected,
  onSelect,
}: {
  zona: Zona;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const variant = riskVariant(zona.nivelRiesgo);
  return (
    <button
      type="button"
      className={`rev-zones-list-item rev-zones-list-item--${variant}${selected ? ' rev-zones-list-item--selected' : ''}`}
      onClick={() => onSelect(zona.id)}
    >
      <span className="rev-zones-list-item__icon" aria-hidden="true">
        <i className="bi bi-geo-alt" />
      </span>
      <span className="rev-zones-list-item__body">
        <span className="rev-zones-list-item__name">{zona.nombre}</span>
        <span className="rev-zones-list-item__coords">
          Sector municipal
        </span>
      </span>
      <RiskBadge nivel={zona.nivelRiesgo} />
    </button>
  );
}

export default function ZonasPage() {
  const fetchFn = useCallback(() => fetchZonas(), []);
  const { data: zonas, loading, error, refetch } = useApiQuery({ fetchFn });

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const list = zonas ?? [];
  const filteredList = useMemo(
    () => filterZonas(list, search, riskFilter),
    [list, search, riskFilter],
  );
  const sortedList = useMemo(() => sortZonasByRisk(filteredList), [filteredList]);
  const counts = countZonasByLevel(filteredList);
  const percentages = zonasRiskPercentages(counts);
  const filtersActive = hasActiveFilters(search, riskFilter);
  const selectedZone = filteredList.find((z) => z.id === selectedId) ?? null;
  const highRiskZones = useMemo(
    () => filteredList.filter((z) => z.nivelRiesgo?.toUpperCase() === 'HIGH'),
    [filteredList],
  );

  useEffect(() => {
    if (selectedId != null && !filteredList.some((z) => z.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredList, selectedId]);

  const viewState = loading ? 'loading' : error ? 'error' : list.length === 0 ? 'empty' : 'idle';
  const showFilteredEmpty = viewState === 'idle' && filteredList.length === 0;

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('ALL');
    setSelectedId(null);
  };

  const toolbar = (
    <div className="rev-zones-command-bar">
      <ZonasKpiStrip counts={counts} />
      <div className="rev-zones-command-bar__controls">
        <ZonasFilters
          search={search}
          riskFilter={riskFilter}
          resultCount={filteredList.length}
          totalCount={list.length}
          onSearchChange={setSearch}
          onRiskFilterChange={setRiskFilter}
          onClear={clearFilters}
          hasActiveFilters={filtersActive}
        />
        <Button variant="outline-secondary" size="sm" onClick={refetch}>
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Topbar
        title="Zonas de riesgo"
        subtitle="Territorio municipal del valle"
        breadcrumbs={[{ label: 'Despacho', to: '/' }, { label: 'Zonas' }]}
      />
      <AppPage>
        <ModuleHub toolbar={toolbar}>
          <StateView
            state={viewState}
            loadingMessage="Cargando zonas de riesgo…"
            errorMessage={error}
            onRetry={refetch}
            emptyTitle="Sin zonas"
            emptyMessage="No hay zonas de riesgo configuradas."
          >
            {showFilteredEmpty ? (
              <div className="rev-zones-empty-filter rev-card">
                <i className="bi bi-funnel rev-zones-empty-filter__icon" aria-hidden="true" />
                <h2 className="rev-zones-empty-filter__title">Sin resultados</h2>
                <p className="rev-zones-empty-filter__text">
                  Ninguna zona coincide con los filtros aplicados.
                </p>
                <Button variant="outline-primary" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="rev-zones-layout">
                <div className="rev-zones-layout__main">
                  <section className="rev-zones-map-section rev-card">
                    <div className="rev-zones-section__header rev-zones-section__header--inset">
                      <div>
                        <h2 className="rev-zones-section__title">Mapa territorial</h2>
                        <p className="rev-zones-section__desc">
                          {filteredList.length} zona{filteredList.length !== 1 ? 's' : ''} visibles
                        </p>
                      </div>
                    </div>
                    <ZonasMap
                      zonas={filteredList}
                      selectedId={selectedId}
                      onSelectZone={setSelectedId}
                    />
                  </section>

                  <section className="rev-card rev-panel-card rev-zones-table-panel">
                    <div className="rev-panel-card__header rev-panel-card__header--compact">
                      <div className="rev-panel-card__header-main">
                        <span className="rev-panel-card__header-icon" aria-hidden="true">
                          <i className="bi bi-table" />
                        </span>
                        <h2 className="rev-panel-card__title">Listado de zonas</h2>
                      </div>
                      <span className="rev-panel-card__badge">{filteredList.length}</span>
                    </div>
                    <div className="rev-data-table-wrap">
                      <table className="rev-data-table rev-data-table--compact">
                        <thead>
                          <tr>
                            <th scope="col">Zona</th>
                            <th scope="col">Nivel de riesgo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedList.map((z) => {
                            const variant = riskVariant(z.nivelRiesgo);
                            return (
                              <tr
                                key={z.id}
                                className={`rev-data-table__row--${variant}${selectedId === z.id ? ' rev-data-table__row--selected' : ''}`}
                                onClick={() => setSelectedId(z.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedId(z.id);
                                  }
                                }}
                              >
                                <td>
                                  <div className="rev-data-table__zone">
                                    <span className="rev-data-table__zone-name">{z.nombre}</span>
                                  </div>
                                </td>
                                <td><RiskBadge nivel={z.nivelRiesgo} /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <aside className="rev-zones-layout__aside rev-card">
                  <div className="rev-zones-rail__block">
                    <h3 className="rev-zones-rail__title">Composición</h3>
                    <div className="rev-risk-distribution__bar" role="img" aria-label="Distribución por nivel">
                      {percentages.high > 0 && (
                        <span className="rev-risk-distribution__segment rev-risk-distribution__segment--high" style={{ width: `${percentages.high}%` }} />
                      )}
                      {percentages.medium > 0 && (
                        <span className="rev-risk-distribution__segment rev-risk-distribution__segment--medium" style={{ width: `${percentages.medium}%` }} />
                      )}
                      {percentages.low > 0 && (
                        <span className="rev-risk-distribution__segment rev-risk-distribution__segment--low" style={{ width: `${percentages.low}%` }} />
                      )}
                    </div>
                    <div className="rev-risk-distribution__legend rev-risk-distribution__legend--stack">
                      <span className="rev-risk-distribution__legend-item">
                        <span className="rev-risk-distribution__dot rev-risk-distribution__dot--high" />
                        Alto · {percentages.high}%
                      </span>
                      <span className="rev-risk-distribution__legend-item">
                        <span className="rev-risk-distribution__dot rev-risk-distribution__dot--medium" />
                        Medio · {percentages.medium}%
                      </span>
                      <span className="rev-risk-distribution__legend-item">
                        <span className="rev-risk-distribution__dot rev-risk-distribution__dot--low" />
                        Bajo · {percentages.low}%
                      </span>
                    </div>
                  </div>

                  {selectedZone && (
                    <div className="rev-zones-rail__block rev-zones-selected">
                      <h3 className="rev-zones-rail__title">Zona seleccionada</h3>
                      <p className="rev-zones-selected__name">{selectedZone.nombre}</p>
                      <RiskBadge nivel={selectedZone.nivelRiesgo} />
                      <p className="rev-zones-selected__hint text-muted small mb-0 mt-2">
                        Delimitación visible en el mapa interactivo.
                      </p>
                    </div>
                  )}

                  {highRiskZones.length > 0 && (
                    <div className="rev-zones-rail__block">
                      <h3 className="rev-zones-rail__title">Prioridad alta</h3>
                      <ul className="rev-zones-rail__list">
                        {highRiskZones.map((z) => (
                          <li key={z.id}>
                            <button type="button" className="rev-zones-rail__list-btn" onClick={() => setSelectedId(z.id)}>
                              <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                              {z.nombre}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rev-zones-rail__block rev-zones-rail__block--list">
                    <h3 className="rev-zones-rail__title">Listado rápido</h3>
                    <div className="rev-zones-list">
                      {sortedList.map((z) => (
                        <ZonaListItem
                          key={z.id}
                          zona={z}
                          selected={selectedId === z.id}
                          onSelect={setSelectedId}
                        />
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </StateView>
        </ModuleHub>
      </AppPage>
    </>
  );
}
