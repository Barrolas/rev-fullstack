import type { ReactNode } from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { DashboardItem } from '../../api';
import RiskBadge from '../RiskBadge';
import { formatEstadoLabel, ESTADO_ORDER } from '../../utils/dashboardAggregates';
import { getEstadoVisual, isHighPriorityIncident } from '../../utils/incidentesFilters';

interface IncidentesTableProps {
  items: DashboardItem[];
}

export default function IncidentesTable({ items }: IncidentesTableProps) {
  return (
    <div className="rev-data-table-wrap rev-incidentes-table-wrap">
      <table className="rev-data-table rev-data-table--compact rev-incidentes-table">
        <thead>
          <tr>
            <th scope="col">Incidente</th>
            <th scope="col">Estado</th>
            <th scope="col">Riesgo</th>
            <th scope="col">Rec.</th>
            <th scope="col" className="rev-incidentes-table__col-coords">Ubicación</th>
            <th scope="col"><span className="visually-hidden">Acción</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const { incidente, zonaRiesgo, recursos, degraded } = item;
            const highPriority = isHighPriorityIncident(item);
            const estado = getEstadoVisual(incidente.estado);
            return (
              <tr
                key={incidente.id}
                className={[
                  `rev-incidentes-table__row--${estado.slug}`,
                  highPriority ? 'rev-incidentes-table__row--priority' : '',
                  degraded ? 'rev-incidentes-table__row--degraded' : '',
                ].filter(Boolean).join(' ') || undefined}
              >
                <td>
                  <div className="rev-incidentes-table__cell-main">
                    <span className="rev-incidentes-table__type">{incidente.tipo}</span>
                    <span className="rev-incidentes-table__desc">{incidente.descripcion}</span>
                  </div>
                  {degraded && (
                    <span className="rev-incidentes-table__degraded-tag">
                      <i className="bi bi-shield-exclamation" aria-hidden="true" /> Info parcial
                    </span>
                  )}
                </td>
                <td>
                  <span className={`rev-incidentes-table__estado rev-incidentes-table__estado--${estado.slug}`}>
                    <i className={`bi ${estado.icon}`} aria-hidden="true" />
                    {formatEstadoLabel(incidente.estado)}
                  </span>
                </td>
                <td>
                  <RiskBadge nivel={zonaRiesgo.nivel} />
                </td>
                <td>
                  <span className={`rev-incidentes-table__num${recursos.length === 0 ? ' rev-incidentes-table__num--empty' : ''}`}>
                    {recursos.length}
                  </span>
                </td>
                <td className="rev-incidentes-table__col-coords">
                  <Link to="/zonas" className="rev-incidentes-table__map-link">
                    Ver en mapa
                  </Link>
                </td>
                <td>
                  <Link to={`/incidentes/${incidente.id}`} className="rev-incidentes-table__link">
                    Ver
                    <i className="bi bi-arrow-right-short" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface IncidentesSummaryRailProps {
  items: DashboardItem[];
  onFilterEstado: (estado: string) => void;
  onFilterHighRisk: () => void;
  onFilterSinRecursos: () => void;
  onFilterDegradados: () => void;
}

export function IncidentesSummaryRail({
  items,
  onFilterEstado,
  onFilterHighRisk,
  onFilterSinRecursos,
  onFilterDegradados,
}: IncidentesSummaryRailProps) {
  const counts: Record<string, number> = {};
  let highRisk = 0;
  let sinRecursos = 0;
  let degradados = 0;
  let activos = 0;

  for (const item of items) {
    const estado = item.incidente.estado;
    counts[estado] = (counts[estado] ?? 0) + 1;
    if (estado !== 'CERRADO') activos += 1;
    if (isHighPriorityIncident(item)) highRisk += 1;
    if (item.recursos.length === 0 && item.incidente.estado !== 'CERRADO') sinRecursos += 1;
    if (item.degraded) degradados += 1;
  }

  const total = items.length;
  const segments = ESTADO_ORDER
    .map((estado) => ({ estado, count: counts[estado] ?? 0 }))
    .filter(({ count }) => count > 0);

  return (
    <div className="rev-incidentes-rail">
      <header className="rev-incidentes-rail__head">
        <div>
          <h3 className="rev-incidentes-rail__title">Distribución</h3>
          <p className="rev-incidentes-rail__meta">{activos} activos · {total} total</p>
        </div>
      </header>

      {segments.length > 0 && (
        <div
          className="rev-incidentes-rail__stack"
          role="img"
          aria-label="Distribución por estado"
        >
          {segments.map(({ estado, count }) => {
            const visual = getEstadoVisual(estado);
            return (
              <button
                key={estado}
                type="button"
                className={`rev-incidentes-rail__stack-seg rev-incidentes-rail__stack-seg--${visual.slug}`}
                style={{ flex: count }}
                onClick={() => onFilterEstado(estado)}
                title={`${formatEstadoLabel(estado)}: ${count}`}
                aria-label={`Filtrar ${formatEstadoLabel(estado)}, ${count}`}
              />
            );
          })}
        </div>
      )}

      <div className="rev-incidentes-rail__legend">
        {segments.map(({ estado, count }) => {
          const visual = getEstadoVisual(estado);
          return (
            <button
              key={estado}
              type="button"
              className="rev-incidentes-rail__legend-row"
              onClick={() => onFilterEstado(estado)}
            >
              <span className={`rev-incidentes-rail__legend-dot rev-incidentes-rail__legend-dot--${visual.slug}`} aria-hidden="true" />
              <span className="rev-incidentes-rail__legend-label">{formatEstadoLabel(estado)}</span>
              <span className="rev-incidentes-rail__legend-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="rev-incidentes-rail__shortcuts">
        <button type="button" className="rev-incidentes-rail__shortcut" onClick={onFilterHighRisk}>
          <span className="rev-incidentes-rail__shortcut-icon">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
          </span>
          <span className="rev-incidentes-rail__shortcut-label">Alto riesgo</span>
          <strong>{highRisk}</strong>
        </button>
        <button type="button" className="rev-incidentes-rail__shortcut" onClick={onFilterSinRecursos}>
          <span className="rev-incidentes-rail__shortcut-icon">
            <i className="bi bi-slash-circle" aria-hidden="true" />
          </span>
          <span className="rev-incidentes-rail__shortcut-label">Sin recursos</span>
          <strong>{sinRecursos}</strong>
        </button>
        {degradados > 0 && (
          <button type="button" className="rev-incidentes-rail__shortcut rev-incidentes-rail__shortcut--warn" onClick={onFilterDegradados}>
            <span className="rev-incidentes-rail__shortcut-icon">
              <i className="bi bi-shield-exclamation" aria-hidden="true" />
            </span>
            <span className="rev-incidentes-rail__shortcut-label">Info parcial</span>
            <strong>{degradados}</strong>
          </button>
        )}
      </div>
    </div>
  );
}

interface IncidentesGroupedListProps {
  groups: { estado: string; items: DashboardItem[] }[];
  viewMode: 'cards' | 'table';
  collapsedGroups: Set<string>;
  onToggleGroup: (estado: string) => void;
  renderCards: (items: DashboardItem[]) => ReactNode;
}

export function IncidentesGroupedList({
  groups,
  viewMode,
  collapsedGroups,
  onToggleGroup,
  renderCards,
}: IncidentesGroupedListProps) {
  if (viewMode === 'table') {
    const allItems = groups.flatMap((g) => g.items);
    return <IncidentesTable items={allItems} />;
  }

  return (
    <div className="rev-incidentes-groups">
      {groups.map(({ estado, items }) => {
        const collapsed = collapsedGroups.has(estado);
        const visual = getEstadoVisual(estado);
        return (
          <section
            key={estado}
            className={`rev-incidentes-group rev-incidentes-group--${visual.slug}`}
          >
            <button
              type="button"
              className="rev-incidentes-group__head"
              onClick={() => onToggleGroup(estado)}
              aria-expanded={!collapsed}
            >
              <span className={`rev-incidentes-group__icon rev-incidentes-group__icon--${visual.slug}`} aria-hidden="true">
                <i className={`bi ${visual.icon}`} />
              </span>
              <span className="rev-incidentes-group__title">{formatEstadoLabel(estado)}</span>
              <Badge bg="secondary" className="rev-incidentes-group__badge">{items.length}</Badge>
              <i className={`bi bi-chevron-${collapsed ? 'down' : 'up'} rev-incidentes-group__chevron`} aria-hidden="true" />
            </button>
            {!collapsed && (
              <div className="rev-incidentes-group__body">
                {renderCards(items)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export { IncidentesTable as IncidentesTableView };
