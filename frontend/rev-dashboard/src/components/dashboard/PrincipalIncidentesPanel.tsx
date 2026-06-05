import { useMemo, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { DashboardItem } from '../../api';
import RiskBadge from '../RiskBadge';
import ZonasMap from '../zonas/ZonasMap';
import {
  formatEstadoLabel,
  getActiveDashboardItems,
} from '../../utils/dashboardAggregates';
import {
  getEstadoVisual,
  isHighPriorityIncident,
  sortIncidents,
} from '../../utils/incidentesFilters';
import { buildMapaTerritorialFromDashboard } from '../../utils/territorialMapUtils';

export const PRINCIPAL_INCIDENTES_LIMIT = 6;

interface PrincipalIncidentesPanelProps {
  items: DashboardItem[];
  limit?: number;
  variant?: 'inicio' | 'despacho';
  className?: string;
}

export default function PrincipalIncidentesPanel({
  items,
  limit = PRINCIPAL_INCIDENTES_LIMIT,
  variant = 'inicio',
  className = '',
}: PrincipalIncidentesPanelProps) {
  const [selectedIncidenteId, setSelectedIncidenteId] = useState<string | null>(null);

  const activos = useMemo(() => getActiveDashboardItems(items), [items]);
  const principal = useMemo(
    () => sortIncidents(activos, 'priority', 'activos').slice(0, limit),
    [activos, limit],
  );

  const mapaPreview = useMemo(
    () => buildMapaTerritorialFromDashboard([], principal),
    [principal],
  );

  const sinUbicacion = principal.length - mapaPreview.incidentes.length;
  const restantes = Math.max(0, activos.length - principal.length);
  const rootClass = [
    'rev-principal-incidentes',
    `rev-principal-incidentes--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label="Principales incidentes activos">
      <header className="rev-principal-incidentes__head">
        <div>
          <p className="rev-principal-incidentes__eyebrow">Operación en curso</p>
          <h2 className="rev-principal-incidentes__title">Principales incidentes</h2>
          <p className="rev-principal-incidentes__desc">
            {activos.length === 0
              ? 'No hay emergencias activas en este momento'
              : `${activos.length} activo${activos.length !== 1 ? 's' : ''} · mostrando los ${Math.min(limit, activos.length)} de mayor prioridad`}
          </p>
        </div>
        <div className="rev-principal-incidentes__actions">
          {activos.length > 0 && (
            <Link to="/zonas" className="rev-principal-incidentes__action rev-principal-incidentes__action--secondary">
              Ver mapa completo
              <i className="bi bi-map" aria-hidden="true" />
            </Link>
          )}
          <Link to="/incidentes" className="rev-principal-incidentes__action">
            Ver todos
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {principal.length === 0 ? (
        <p className="rev-principal-incidentes__empty">
          <i className="bi bi-check-circle" aria-hidden="true" />
          Sin incidentes activos. El turno está en calma.
        </p>
      ) : (
        <div className="rev-principal-incidentes__body">
          <ol className="rev-principal-incidentes__list">
            {principal.map((item, index) => {
              const { incidente } = item;
              const estado = getEstadoVisual(incidente.estado);
              const highPriority = isHighPriorityIncident(item);
              const selected = selectedIncidenteId === incidente.id;
              const hasCoords = incidente.lat != null && incidente.lng != null;

              return (
                <li key={incidente.id}>
                  <article
                    className={[
                      'rev-principal-incidentes__row',
                      highPriority ? 'rev-principal-incidentes__row--priority' : '',
                      selected ? 'rev-principal-incidentes__row--selected' : '',
                      !hasCoords ? 'rev-principal-incidentes__row--no-coords' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="rev-principal-incidentes__rank" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="rev-principal-incidentes__main">
                      <div className="rev-principal-incidentes__top">
                        <Link
                          to={`/incidentes/${incidente.id}`}
                          className="rev-principal-incidentes__type"
                        >
                          {incidente.tipo}
                        </Link>
                        <div className="rev-principal-incidentes__badges">
                          {highPriority && (
                            <Badge bg="danger" className="rev-principal-incidentes__badge">
                              Alto riesgo
                            </Badge>
                          )}
                          <Badge bg={estado.variant} className="rev-principal-incidentes__badge">
                            {formatEstadoLabel(incidente.estado)}
                          </Badge>
                        </div>
                      </div>
                      <p className="rev-principal-incidentes__note">{incidente.descripcion}</p>
                      <div className="rev-principal-incidentes__meta">
                        <RiskBadge nivel={item.zonaRiesgo.nivel} />
                        <span>
                          {item.recursos.length} recurso{item.recursos.length !== 1 ? 's' : ''}
                        </span>
                        {!hasCoords && (
                          <span className="rev-principal-incidentes__no-gps">Sin GPS</span>
                        )}
                      </div>
                    </div>
                    <div className="rev-principal-incidentes__row-actions">
                      {hasCoords && (
                        <button
                          type="button"
                          className={`rev-principal-incidentes__map-btn${selected ? ' rev-principal-incidentes__map-btn--active' : ''}`}
                          onClick={() =>
                            setSelectedIncidenteId((current) =>
                              current === incidente.id ? null : incidente.id,
                            )
                          }
                          title="Ubicar en mapa"
                        >
                          <i className="bi bi-geo-alt" aria-hidden="true" />
                          <span className="visually-hidden">Ubicar en mapa</span>
                        </button>
                      )}
                      <Link
                        to={`/incidentes/${incidente.id}`}
                        className="rev-principal-incidentes__detail-link"
                      >
                        Detalle
                        <i className="bi bi-arrow-up-right" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>

          <div className="rev-principal-incidentes__map-wrap">
            {mapaPreview.incidentes.length > 0 ? (
              <ZonasMap
                zonas={[]}
                incidentes={mapaPreview.incidentes}
                radioCorrelacionMetros={mapaPreview.radioCorrelacionMetros}
                selectedIncidenteId={selectedIncidenteId}
                onSelectIncidente={setSelectedIncidenteId}
                showLegend={false}
                className="rev-principal-incidentes__map"
              />
            ) : (
              <div className="rev-principal-incidentes__map-placeholder">
                <i className="bi bi-geo-alt" aria-hidden="true" />
                <p>Los incidentes activos no tienen coordenadas para mostrar en el mapa.</p>
              </div>
            )}
            {sinUbicacion > 0 && mapaPreview.incidentes.length > 0 && (
              <p className="rev-principal-incidentes__map-hint">
                {sinUbicacion} caso{sinUbicacion !== 1 ? 's' : ''} sin ubicación GPS
              </p>
            )}
          </div>
        </div>
      )}

      {restantes > 0 && (
        <footer className="rev-principal-incidentes__footer">
          <Link to="/incidentes" className="rev-principal-incidentes__more">
            + {restantes} incidente{restantes !== 1 ? 's' : ''} activo{restantes !== 1 ? 's' : ''} más
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </footer>
      )}
    </section>
  );
}
