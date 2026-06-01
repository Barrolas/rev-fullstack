import { Badge, Button, Form } from 'react-bootstrap';
import { ESTADO_ORDER, formatEstadoLabel } from '../../utils/dashboardAggregates';
import type {
  IncidentEstadoFilter,
  IncidentFiltersState,
  IncidentRiskFilter,
  IncidentSort,
  IncidentViewMode,
} from '../../utils/incidentesFilters';

const RISK_OPTIONS: { value: IncidentRiskFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'HIGH', label: 'Alto' },
  { value: 'MEDIUM', label: 'Medio' },
  { value: 'LOW', label: 'Bajo' },
];

const SORT_OPTIONS: { value: IncidentSort; label: string }[] = [
  { value: 'priority', label: 'Prioridad' },
  { value: 'tipo', label: 'Tipo' },
  { value: 'recursos', label: 'Recursos' },
];

interface IncidentesFiltersProps {
  filters: IncidentFiltersState;
  viewMode: IncidentViewMode;
  resultCount: number;
  totalCount: number;
  onFiltersChange: (patch: Partial<IncidentFiltersState>) => void;
  onViewModeChange: (mode: IncidentViewMode) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function IncidentesFilters({
  filters,
  viewMode,
  resultCount,
  totalCount,
  onFiltersChange,
  onViewModeChange,
  onClear,
  hasActiveFilters,
}: IncidentesFiltersProps) {
  return (
    <div className="rev-incidentes-filters">
      <div className="rev-incidentes-filters__primary">
        <div className="rev-incidentes-filters__search">
          <i className="bi bi-search rev-incidentes-filters__search-icon" aria-hidden="true" />
          <Form.Control
            type="search"
            size="sm"
            className="rev-incidentes-filters__input"
            placeholder="Buscar tipo, descripción o ID…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            aria-label="Buscar incidentes"
          />
        </div>

        <div className="rev-incidentes-filters__chips" role="group" aria-label="Filtrar por riesgo">
          {RISK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`rev-incidentes-filters__chip${filters.riskFilter === opt.value ? ' rev-incidentes-filters__chip--active' : ''}${opt.value !== 'ALL' ? ` rev-incidentes-filters__chip--${opt.value.toLowerCase()}` : ''}`}
              onClick={() => onFiltersChange({ riskFilter: opt.value })}
              aria-pressed={filters.riskFilter === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Form.Select
          size="sm"
          className="rev-incidentes-filters__select"
          value={filters.estadoFilter}
          onChange={(e) =>
            onFiltersChange({ estadoFilter: e.target.value as IncidentEstadoFilter })
          }
          aria-label="Filtrar por estado"
        >
          <option value="ALL">Estado: todos</option>
          {ESTADO_ORDER.map((estado) => (
            <option key={estado} value={estado}>
              {formatEstadoLabel(estado)}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          size="sm"
          className="rev-incidentes-filters__select rev-incidentes-filters__select--sort"
          value={filters.sort}
          onChange={(e) => onFiltersChange({ sort: e.target.value as IncidentSort })}
          aria-label="Ordenar incidentes"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>

        <div className="rev-incidentes-filters__view" role="group" aria-label="Modo de vista">
          <button
            type="button"
            className={`rev-incidentes-filters__view-btn${viewMode === 'cards' ? ' rev-incidentes-filters__view-btn--active' : ''}`}
            onClick={() => onViewModeChange('cards')}
            aria-pressed={viewMode === 'cards'}
            title="Vista tarjetas"
          >
            <i className="bi bi-grid" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`rev-incidentes-filters__view-btn${viewMode === 'table' ? ' rev-incidentes-filters__view-btn--active' : ''}`}
            onClick={() => onViewModeChange('table')}
            aria-pressed={viewMode === 'table'}
            title="Vista tabla"
          >
            <i className="bi bi-table" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="rev-incidentes-filters__secondary">
        <div className="rev-incidentes-filters__toggles">
          <label className="rev-incidentes-filters__toggle">
            <Form.Check
              type="switch"
              id="incidentes-activos-only"
              checked={filters.activosOnly}
              onChange={(e) => onFiltersChange({ activosOnly: e.target.checked })}
            />
            <span>Solo activos</span>
          </label>
          <label className="rev-incidentes-filters__toggle">
            <Form.Check
              type="switch"
              id="incidentes-sin-recursos"
              checked={filters.sinRecursos}
              onChange={(e) => onFiltersChange({ sinRecursos: e.target.checked })}
            />
            <span>Sin recursos</span>
          </label>
          <label className="rev-incidentes-filters__toggle">
            <Form.Check
              type="switch"
              id="incidentes-correlacion-pendiente"
              checked={filters.correlacionPendienteOnly}
              onChange={(e) => onFiltersChange({ correlacionPendienteOnly: e.target.checked })}
            />
            <span>Correlación pendiente</span>
          </label>
        </div>

        <div className="rev-incidentes-filters__meta">
          <Badge bg="secondary" className="rev-incidentes-filters__count">
            {resultCount} / {totalCount}
          </Badge>
          {hasActiveFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="rev-incidentes-filters__clear"
              onClick={onClear}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
