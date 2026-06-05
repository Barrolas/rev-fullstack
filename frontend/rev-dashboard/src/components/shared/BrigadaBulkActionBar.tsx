import { Button } from 'react-bootstrap';

interface BrigadaBulkActionBarProps {
  count: number;
  onDespachar: () => void;
  onDotacion?: () => void;
  onClear: () => void;
  dotacionDisabled?: boolean;
}

export default function BrigadaBulkActionBar({
  count,
  onDespachar,
  onDotacion,
  onClear,
  dotacionDisabled,
}: BrigadaBulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="rev-brigada-bulk-bar" role="region" aria-label="Acciones masivas">
      <span className="rev-brigada-bulk-bar__count">
        {count} brigada{count !== 1 ? 's' : ''} seleccionada{count !== 1 ? 's' : ''}
      </span>
      <div className="rev-brigada-bulk-bar__actions">
        <Button size="sm" variant="primary" onClick={onDespachar}>
          <i className="bi bi-send me-1" aria-hidden="true" />
          Despachar a incidente…
        </Button>
        {onDotacion && (
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={onDotacion}
            disabled={count !== 1 || dotacionDisabled}
            title={count !== 1 ? 'Seleccione una sola brigada' : undefined}
          >
            <i className="bi bi-gear me-1" aria-hidden="true" />
            Configurar dotación
          </Button>
        )}
        <Button size="sm" variant="link" className="text-muted" onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
