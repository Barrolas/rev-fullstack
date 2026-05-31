import { Spinner } from 'react-bootstrap';
import ErrorAlert from '../ErrorAlert';

interface StateViewProps {
  state: 'loading' | 'empty' | 'error' | 'idle';
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export default function StateView({
  state,
  loadingMessage = 'Cargando...',
  emptyTitle = 'Sin datos',
  emptyMessage = 'No hay registros para mostrar.',
  emptyAction,
  errorMessage,
  onRetry,
  children,
}: StateViewProps) {
  if (state === 'loading') {
    return (
      <div className="rev-state-view">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 mb-0">{loadingMessage}</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rev-state-view">
        <i className="bi bi-exclamation-triangle rev-state-view__icon text-warning" />
        <div className="rev-state-view__title">Error al cargar</div>
        <ErrorAlert message={errorMessage ?? 'Ocurrió un error inesperado'} />
        {onRetry && (
          <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rev-state-view">
        <i className="bi bi-inbox rev-state-view__icon" />
        <div className="rev-state-view__title">{emptyTitle}</div>
        <p className="mb-2">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return <>{children}</>;
}
