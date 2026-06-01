import { Button, Form } from 'react-bootstrap';

import type { RiskFilter } from '../../utils/zonasFilters';

const RISK_OPTIONS: { value: RiskFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'HIGH', label: 'Alto' },
  { value: 'MEDIUM', label: 'Medio' },
  { value: 'LOW', label: 'Bajo' },
];

interface ZonasFiltersProps {
  search: string;
  riskFilter: RiskFilter;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onRiskFilterChange: (value: RiskFilter) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function ZonasFilters({
  search,
  riskFilter,
  resultCount,
  totalCount,
  onSearchChange,
  onRiskFilterChange,
  onClear,
  hasActiveFilters,
}: ZonasFiltersProps) {
  return (
    <div className="rev-zones-filters">
      <div className="rev-zones-filters__search">
        <i className="bi bi-search rev-zones-filters__search-icon" aria-hidden="true" />
        <Form.Control
          type="search"
          size="sm"
          className="rev-zones-filters__input"
          placeholder="Buscar zona por nombre…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar zona por nombre"
        />
      </div>

      <div className="rev-zones-filters__levels" role="group" aria-label="Filtrar por nivel de riesgo">
        {RISK_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`rev-zones-filters__chip${riskFilter === opt.value ? ' rev-zones-filters__chip--active' : ''}${opt.value !== 'ALL' ? ` rev-zones-filters__chip--${opt.value.toLowerCase()}` : ''}`}
            onClick={() => onRiskFilterChange(opt.value)}
            aria-pressed={riskFilter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rev-zones-filters__meta">
        <span className="rev-zones-filters__count">
          {resultCount} de {totalCount} zonas
        </span>
        {hasActiveFilters && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="rev-zones-filters__clear"
            onClick={onClear}
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
