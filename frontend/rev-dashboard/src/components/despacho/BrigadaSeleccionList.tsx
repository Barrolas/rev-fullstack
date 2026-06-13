import { Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { DespachoBrigadaCard } from '../../api';
import type { useBrigadaSelection } from '../../hooks/useBrigadaSelection';

function semaforoClass(lista: boolean): string {
  return lista ? 'rev-despacho-semaforo--ok' : 'rev-despacho-semaforo--warn';
}

type BrigadaSelection = ReturnType<typeof useBrigadaSelection>;

interface BrigadaSeleccionListProps {
  brigadas: DespachoBrigadaCard[];
  selection: BrigadaSelection;
  enabled?: boolean;
  disabledHint?: string;
  onToggle?: () => void;
}

export default function BrigadaSeleccionList({
  brigadas,
  selection,
  enabled = true,
  disabledHint = 'Seleccione primero un incidente para habilitar la asignación de brigada.',
  onToggle,
}: BrigadaSeleccionListProps) {
  const sorted = [...brigadas].sort((a, b) => {
    if (a.listaParaDespacho !== b.listaParaDespacho) {
      return a.listaParaDespacho ? -1 : 1;
    }
    return a.nombre.localeCompare(b.nombre, 'es');
  });

  if (!enabled) {
    return <p className="rev-despacho-brigadas-hint mb-0">{disabledHint}</p>;
  }

  if (sorted.length === 0) {
    return (
      <div className="rev-despacho-empty">
        <i className="bi bi-people" aria-hidden />
        <p className="mb-2">No hay brigadas registradas como disponibles.</p>
        <Link to="/recursos" className="btn btn-sm btn-outline-primary">
          Ir a Recursos
        </Link>
      </div>
    );
  }

  return (
    <div className="rev-despacho-brigadas-list">
      {sorted.map((b) => {
        const cap = b.elegibilidad?.capacidadBrigada ?? 0;
        const integ = b.elegibilidad?.integrantes ?? 0;
        const pct = cap > 0 ? Math.min(100, Math.round((integ / cap) * 100)) : 0;
        const bulkSelectable = selection.canSelect({
          id: b.id,
          estado: b.estado,
          listaParaDespacho: b.listaParaDespacho,
        });

        return (
          <button
            key={b.id}
            type="button"
            className={`rev-despacho-brigada-card${selection.isSelected(b.id) ? ' selected' : ''}`}
            onClick={() => {
              if (!bulkSelectable) return;
              selection.toggle(b.id);
              onToggle?.();
            }}
          >
            <div className="rev-despacho-brigada-card__row">
              <Form.Check
                type="checkbox"
                className="rev-despacho-brigada-card__check"
                aria-label={`Seleccionar ${b.nombre} para despacho`}
                checked={selection.isSelected(b.id)}
                disabled={!bulkSelectable}
                onClick={(e) => e.stopPropagation()}
                onChange={() => {
                  selection.toggle(b.id);
                  onToggle?.();
                }}
              />
              <span className={`rev-despacho-semaforo ${semaforoClass(b.listaParaDespacho)}`} />
              <span className="rev-despacho-brigada-card__nombre">{b.nombre}</span>
              <span
                className={`rev-despacho-brigada-card__estado ${b.listaParaDespacho ? 'rev-despacho-brigada-card__estado--ok' : 'rev-despacho-brigada-card__estado--warn'}`}
              >
                {b.listaParaDespacho ? 'Lista' : 'Incompleta'}
              </span>
            </div>
            {cap > 0 && (
              <>
                <div className="rev-despacho-brigada-card__progress" aria-hidden>
                  <div
                    className={`rev-despacho-brigada-card__progress-bar${b.listaParaDespacho ? ' rev-despacho-brigada-card__progress-bar--ok' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="rev-despacho-brigada-card__meta">
                  Dotación {integ}/{cap} integrantes
                  {b.elegibilidad?.capacidadPasajerosVehiculoPrincipal != null &&
                    ` · ${b.elegibilidad.capacidadPasajerosVehiculoPrincipal} plazas vehículo principal`}
                </span>
              </>
            )}
            {!b.listaParaDespacho && b.elegibilidad?.motivos?.length ? (
              <ul className="rev-despacho-brigada-card__motivos">
                {b.elegibilidad.motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
