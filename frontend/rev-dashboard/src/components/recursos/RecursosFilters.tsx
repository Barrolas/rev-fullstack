import { Badge, Button, Form } from 'react-bootstrap';
import type { RecursoAvailabilityFilter, RecursosFiltersState } from '../../utils/recursosUtils';

const AVAILABILITY_OPTIONS: { value: RecursoAvailabilityFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DISPONIBLE', label: 'Disponibles' },
  { value: 'ASIGNADO', label: 'En uso' },
];

interface RecursosFiltersProps {
  filters: RecursosFiltersState;
  resultCount: number;
  totalCount: number;
  onFiltersChange: (patch: Partial<RecursosFiltersState>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function RecursosFilters({
  filters,
  resultCount,
  totalCount,
  onFiltersChange,
  onClear,
  hasActiveFilters,
}: RecursosFiltersProps) {
  return (
    <div className="rev-recursos-filters">
      <div className="rev-recursos-filters__search">
        <i className="bi bi-search rev-recursos-filters__search-icon" aria-hidden="true" />
        <Form.Control
          type="search"
          size="sm"
          className="rev-recursos-filters__input"
          placeholder="Buscar brigada, patente, herramienta…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          aria-label="Buscar recursos"
        />
      </div>

      <div className="rev-recursos-filters__chips" role="group" aria-label="Filtrar por disponibilidad">
        {AVAILABILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`rev-recursos-filters__chip${filters.availability === opt.value ? ' rev-recursos-filters__chip--active' : ''}${opt.value === 'DISPONIBLE' ? ' rev-recursos-filters__chip--ok' : ''}${opt.value === 'ASIGNADO' ? ' rev-recursos-filters__chip--use' : ''}`}
            onClick={() => onFiltersChange({ availability: opt.value })}
            aria-pressed={filters.availability === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rev-recursos-filters__meta">
        <Badge bg="secondary" className="rev-recursos-filters__count">
          {resultCount} de {totalCount}
        </Badge>
        {hasActiveFilters && (
          <Button variant="outline-secondary" size="sm" onClick={onClear}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
