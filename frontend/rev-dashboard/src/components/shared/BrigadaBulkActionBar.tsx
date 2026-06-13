import { useState } from 'react';
import { Button } from 'react-bootstrap';
import RevModal from '../primitives/RevModal';

interface BrigadaBulkActionBarProps {
  count: number;
  onDespachar: () => void;
  onDespachoRapido?: () => void;
  despachoRapidoLoading?: boolean;
  onDotacion?: () => void;
  onClear: () => void;
  dotacionDisabled?: boolean;
}

export default function BrigadaBulkActionBar({
  count,
  onDespachar,
  onDespachoRapido,
  despachoRapidoLoading,
  onDotacion,
  onClear,
  dotacionDisabled,
}: BrigadaBulkActionBarProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  if (count === 0) return null;

  return (
    <>
    <div className="rev-brigada-bulk-bar" role="region" aria-label="Acciones masivas">
      <div className="rev-brigada-bulk-bar__head">
        <span className="rev-brigada-bulk-bar__count">
          {count} brigada{count !== 1 ? 's' : ''} seleccionada{count !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className="rev-brigada-bulk-bar__info"
          onClick={() => setInfoOpen(true)}
          aria-label="Información sobre modos de despacho"
          title="¿Qué modo de despacho elegir?"
        >
          <i className="bi bi-info-circle" aria-hidden="true" />
        </button>
      </div>
      <div className="rev-brigada-bulk-bar__actions">
        <Button size="sm" variant="primary" onClick={onDespachar}>
          <i className="bi bi-list-check me-1" aria-hidden="true" />
          Despacho con asistente
        </Button>
        {onDespachoRapido && (
          <Button
            size="sm"
            variant="success"
            onClick={onDespachoRapido}
            disabled={despachoRapidoLoading}
          >
            {despachoRapidoLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" />
                Despachando…
              </>
            ) : (
              <>
                <i className="bi bi-lightning-fill me-1" aria-hidden="true" />
                Despacho rápido
              </>
            )}
          </Button>
        )}
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

    <RevModal
      show={infoOpen}
      onHide={() => setInfoOpen(false)}
      title="Modos de despacho"
      size="lg"
      footer={
        <Button variant="primary" onClick={() => setInfoOpen(false)}>
          Entendido
        </Button>
      }
    >
      <div className="rev-despacho-modes-help">
        <section className="rev-despacho-modes-help__block">
          <h3 className="rev-despacho-modes-help__title">
            <i className="bi bi-list-check text-primary me-2" aria-hidden="true" />
            Despacho con asistente
          </h3>
          <p className="rev-despacho-modes-help__lead">
            Abre un asistente paso a paso antes de enviar la brigada al incidente.
          </p>
          <p className="mb-2"><strong>Qué permite:</strong></p>
          <ul>
            <li>Revisar y ajustar integrantes, vehículos y herramientas por brigada.</li>
            <li>Confirmar la composición con un resumen de solo lectura.</li>
            <li>Despachar varias brigadas al mismo incidente en un solo lote.</li>
            <li>Validar plazas de vehículos frente al número de integrantes.</li>
          </ul>
          <p className="mb-0">
            <strong>Recomendado cuando:</strong> el incidente es complejo, la dotación no está
            estándar, necesita vehículo o kit específico, o despacha más de una brigada a la vez.
          </p>
        </section>

        {onDespachoRapido ? (
          <section className="rev-despacho-modes-help__block">
            <h3 className="rev-despacho-modes-help__title">
              <i className="bi bi-lightning-fill text-success me-2" aria-hidden="true" />
              Despacho rápido
            </h3>
            <p className="rev-despacho-modes-help__lead">
              Envía la brigada con la dotación completa ya configurada en Recursos, sin pasos
              intermedios.
            </p>
            <p className="mb-2"><strong>Qué permite:</strong></p>
            <ul>
              <li>Usar automáticamente todos los integrantes disponibles de la brigada.</li>
              <li>Incluir vehículos y kit según la composición guardada.</li>
              <li>Confirmar en un solo diálogo y pasar a activos en terreno.</li>
            </ul>
            <p className="mb-0">
              <strong>Recomendado cuando:</strong> la brigada está lista, el incidente es rutinario
              y no requiere ajustar personal ni equipamiento (por ejemplo, basureros, avisos urbanos
              de baja complejidad).
            </p>
          </section>
        ) : (
          <section className="rev-despacho-modes-help__block rev-despacho-modes-help__block--muted">
            <p className="mb-0 text-muted small">
              Desde Despacho operativo también puede usar <strong>Despacho rápido</strong> cuando
              ya tiene un incidente seleccionado en la cola.
            </p>
          </section>
        )}
      </div>
    </RevModal>
    </>
  );
}
