import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMapaTerritorial } from '../api';
import AppPage from '../components/layout/AppPage';
import ModuleHub from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import RiskBadge, { riskVariant } from '../components/RiskBadge';
import ZonasAdminPanel from '../components/zonas/ZonasAdminPanel';
import ZonasFilters from '../components/zonas/ZonasFilters';
import ZonasMap from '../components/zonas/ZonasMap';
import ZonasModuleTabs, { type ZonasModuleView } from '../components/zonas/ZonasModuleTabs';
import ZonaIncidentePopup from '../components/zonas/ZonaIncidentePopup';
import { useApiQuery } from '../hooks/useApiQuery';
import {
  countZonasByLevel,
  sortZonasByRisk,
  zonasRiskPercentages,
} from '../utils/dashboardAggregates';
import { filterZonas, hasActiveFilters, type RiskFilter } from '../utils/zonasFilters';
import { findIncidentePunto } from '../utils/territorialMapUtils';

function ZonasKpiStrip({
  counts,
  incidentesMapa,
  sinUbicacion,
}: {
  counts: ReturnType<typeof countZonasByLevel>;
  incidentesMapa: number;
  sinUbicacion: number;
}) {
  return (
    <div className="rev-zones-kpi-strip" aria-label="Resumen de zonas">
      <span className="rev-zones-kpi rev-zones-kpi--total">
        <i className="bi bi-map" aria-hidden="true" />
        <strong>{counts.total}</strong> zonas
      </span>
      <span className="rev-zones-kpi rev-zones-kpi--incident">
        <i className="bi bi-fire" aria-hidden="true" />
        <strong>{incidentesMapa}</strong> en mapa
      </span>
      {sinUbicacion > 0 && (
        <span className="rev-zones-kpi rev-zones-kpi--muted">
          <i className="bi bi-geo-alt-fill" aria-hidden="true" />
          <strong>{sinUbicacion}</strong> sin GPS
        </span>
      )}
      <span className="rev-zones-kpi rev-zones-kpi--high">
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        <strong>{counts.high}</strong> alto
      </span>
    </div>
  );
}

function ZonaListItem({
  zona,
  selected,
  onSelect,
}: {
  zona: { id: number; nombre: string; nivelRiesgo: string };
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
        <span className="rev-zones-list-item__coords">Buffer circular</span>
      </span>
      <RiskBadge nivel={zona.nivelRiesgo} />
    </button>
  );
}

export default function ZonasPage() {
  const [moduleView, setModuleView] = useState<ZonasModuleView>('mapa');
  const [searchParams] = useSearchParams();
  const incidenteQuery = searchParams.get('incidente');

  const fetchFn = useCallback(() => fetchMapaTerritorial(), []);
  const { data: mapa, loading, error, refetch } = useApiQuery({ fetchFn });

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedIncidenteId, setSelectedIncidenteId] = useState<string | null>(null);

  const list = mapa?.zonas ?? [];
  const incidentes = mapa?.incidentes ?? [];
  const radioCorrelacion = mapa?.radioCorrelacionMetros ?? 500;
  const sinUbicacion = mapa?.incidentesSinUbicacion ?? 0;

  const filteredList = useMemo(
    () => filterZonas(list, search, riskFilter),
    [list, search, riskFilter],
  );
  const sortedList = useMemo(() => sortZonasByRisk(filteredList), [filteredList]);
  const counts = countZonasByLevel(filteredList);
  const percentages = zonasRiskPercentages(counts);
  const filtersActive = hasActiveFilters(search, riskFilter);
  const selectedZone = filteredList.find((z) => z.id === selectedZoneId) ?? null;
  const selectedIncidente = findIncidentePunto(incidentes, selectedIncidenteId);
  const highRiskZones = useMemo(
    () => filteredList.filter((z) => z.nivelRiesgo?.toUpperCase() === 'HIGH'),
    [filteredList],
  );

  useEffect(() => {
    if (incidenteQuery) {
      setSelectedIncidenteId(incidenteQuery);
      setSelectedZoneId(null);
    }
  }, [incidenteQuery]);

  useEffect(() => {
    if (selectedZoneId != null && !filteredList.some((z) => z.id === selectedZoneId)) {
      setSelectedZoneId(null);
    }
  }, [filteredList, selectedZoneId]);

  const viewState = loading ? 'loading' : error ? 'error' : list.length === 0 ? 'empty' : 'idle';
  const showFilteredEmpty = viewState === 'idle' && filteredList.length === 0;

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('ALL');
    setSelectedZoneId(null);
  };

  const toolbar = (
    <div className="rev-zones-command-bar">
      <ZonasKpiStrip
        counts={counts}
        incidentesMapa={incidentes.length}
        sinUbicacion={sinUbicacion}
      />
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
        subtitle="Puente Alto (Valle del Sol) · buffers estratégicos y despacho"
        breadcrumbs={[{ label: 'Despacho', to: '/' }, { label: 'Zonas' }]}
      />
      <AppPage>
        <ZonasModuleTabs active={moduleView} onChange={setModuleView} />
        {moduleView === 'administracion' ? (
          <div className="mt-3">
            <ZonasAdminPanel />
          </div>
        ) : (
        <ModuleHub toolbar={toolbar}>
          <StateView
            state={viewState}
            loadingMessage="Cargando mapa territorial…"
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
                          {filteredList.length} zona{filteredList.length !== 1 ? 's' : ''} ·{' '}
                          {incidentes.length} incidente{incidentes.length !== 1 ? 's' : ''} · radio{' '}
                          {radioCorrelacion} m
                        </p>
                      </div>
                    </div>
                    <ZonasMap
                      zonas={filteredList}
                      incidentes={incidentes}
                      radioCorrelacionMetros={radioCorrelacion}
                      selectedZoneId={selectedZoneId}
                      selectedIncidenteId={selectedIncidenteId}
                      onSelectZone={(id) => {
                        setSelectedZoneId(id);
                        setSelectedIncidenteId(null);
                      }}
                      onSelectIncidente={(id) => {
                        setSelectedIncidenteId(id);
                        setSelectedZoneId(null);
                      }}
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
                                className={`rev-data-table__row--${variant}${selectedZoneId === z.id ? ' rev-data-table__row--selected' : ''}`}
                                onClick={() => {
                                  setSelectedZoneId(z.id);
                                  setSelectedIncidenteId(null);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedZoneId(z.id);
                                    setSelectedIncidenteId(null);
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
                  {selectedIncidente && (
                    <div className="rev-zones-rail__block rev-zones-selected rev-zones-selected--incident">
                      <h3 className="rev-zones-rail__title">Incidente en mapa</h3>
                      <ZonaIncidentePopup punto={selectedIncidente} />
                    </div>
                  )}

                  <div className="rev-zones-rail__block">
                    <h3 className="rev-zones-rail__title">Composición</h3>
                    <div className="rev-risk-distribution__bar" role="img" aria-label="Distribución por nivel">
                      {percentages.high > 0 && (
                        <span
                          className="rev-risk-distribution__segment rev-risk-distribution__segment--high"
                          style={{ width: `${percentages.high}%` }}
                        />
                      )}
                      {percentages.medium > 0 && (
                        <span
                          className="rev-risk-distribution__segment rev-risk-distribution__segment--medium"
                          style={{ width: `${percentages.medium}%` }}
                        />
                      )}
                      {percentages.low > 0 && (
                        <span
                          className="rev-risk-distribution__segment rev-risk-distribution__segment--low"
                          style={{ width: `${percentages.low}%` }}
                        />
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

                  {selectedZone && !selectedIncidente && (
                    <div className="rev-zones-rail__block rev-zones-selected">
                      <h3 className="rev-zones-rail__title">Zona seleccionada</h3>
                      <p className="rev-zones-selected__name">{selectedZone.nombre}</p>
                      <RiskBadge nivel={selectedZone.nivelRiesgo} />
                      <p className="rev-zones-selected__hint text-muted small mb-0 mt-2">
                        Buffer circular en el mapa (estándar FSGDM / NENA).
                      </p>
                    </div>
                  )}

                  {highRiskZones.length > 0 && (
                    <div className="rev-zones-rail__block">
                      <h3 className="rev-zones-rail__title">Prioridad alta</h3>
                      <ul className="rev-zones-rail__list">
                        {highRiskZones.map((z) => (
                          <li key={z.id}>
                            <button
                              type="button"
                              className="rev-zones-rail__list-btn"
                              onClick={() => {
                                setSelectedZoneId(z.id);
                                setSelectedIncidenteId(null);
                              }}
                            >
                              <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                              {z.nombre}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rev-zones-rail__block rev-zones-rail__block--list">
                    <h3 className="rev-zones-rail__title">Incidentes georreferenciados</h3>
                    <div className="rev-zones-list">
                      {incidentes.length === 0 ? (
                        <p className="text-muted small mb-0">Sin incidentes con coordenadas.</p>
                      ) : (
                        incidentes.map((p) => (
                          <button
                            key={p.grupoId}
                            type="button"
                            className={`rev-zones-list-item rev-zones-list-item--incident${selectedIncidenteId === p.id ? ' rev-zones-list-item--selected' : ''}`}
                            onClick={() => {
                              setSelectedIncidenteId(p.id);
                              setSelectedZoneId(null);
                            }}
                          >
                            <span className="rev-zones-list-item__icon" aria-hidden="true">
                              <i className="bi bi-fire" />
                            </span>
                            <span className="rev-zones-list-item__body">
                              <span className="rev-zones-list-item__name">
                                {p.folio ?? p.tipo}
                              </span>
                              <span className="rev-zones-list-item__coords">
                                {p.reportesEnGrupo > 1
                                  ? `${p.reportesEnGrupo} reportes`
                                  : 'Reporte único'}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <p className="small text-muted mt-2 mb-0">
                      <Link to="/incidentes?vista=correlaciones">Revisar correlaciones</Link>
                    </p>
                  </div>

                  <div className="rev-zones-rail__block rev-zones-rail__block--list">
                    <h3 className="rev-zones-rail__title">Listado rápido de zonas</h3>
                    <div className="rev-zones-list">
                      {sortedList.map((z) => (
                        <ZonaListItem
                          key={z.id}
                          zona={z}
                          selected={selectedZoneId === z.id}
                          onSelect={(id) => {
                            setSelectedZoneId(id);
                            setSelectedIncidenteId(null);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </StateView>
        </ModuleHub>
        )}
      </AppPage>
    </>
  );
}
