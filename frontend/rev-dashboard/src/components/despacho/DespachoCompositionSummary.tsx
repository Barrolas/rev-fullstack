import type { DespachoBrigadaDraft } from '../../utils/despachoWizardState';
import { resolveVehiculos, selectedVehiclesCapacity } from '../../utils/despachoWizardState';

interface DespachoCompositionSummaryProps {
  draft: DespachoBrigadaDraft;
}

export default function DespachoCompositionSummary({ draft }: DespachoCompositionSummaryProps) {
  const integrantes = draft.detalle.brigadistas.filter((b) => draft.brigadistaIds.has(b.id));
  const vehiculos = resolveVehiculos(draft).filter((v) => draft.vehiculoIds.has(v.vehiculoId));
  const kit = draft.detalle.herramientas.filter((h) => draft.herramientas.has(h.herramientaId));
  const plazas = selectedVehiclesCapacity(draft);

  return (
    <div className="rev-despacho-summary">
      <div className="rev-despacho-summary__head">
        <span className="rev-despacho-summary__title">{draft.nombre}</span>
        {!draft.listaParaDespacho && (
          <span className="badge bg-warning text-dark ms-2">Dotación incompleta</span>
        )}
      </div>

      <div className="rev-despacho-summary__block">
        <div className="rev-despacho-summary__label">Integrantes ({integrantes.length})</div>
        <ul className="rev-despacho-summary__list">
          {integrantes.map((b) => (
            <li key={b.id}>
              {b.nombre} {b.apellido}
              {b.rolNombre ? ` · ${b.rolNombre}` : ''}
            </li>
          ))}
        </ul>
      </div>

      <div className="rev-despacho-summary__block">
        <div className="rev-despacho-summary__label">
          Vehículos ({vehiculos.length}) · {plazas} plazas
        </div>
        <ul className="rev-despacho-summary__list">
          {vehiculos.map((v) => (
            <li key={v.vehiculoId}>
              {v.patente ?? v.vehiculoId}
              {v.tipo ? ` · ${v.tipo}` : ''}
              {v.capacidadPasajeros != null ? ` · ${v.capacidadPasajeros} plazas` : ''}
              {draft.principalVehiculoId === v.vehiculoId && (
                <span className="rev-despacho-summary__tag">Prioritario</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rev-despacho-summary__block">
        <div className="rev-despacho-summary__label">Kit operativo</div>
        <ul className="rev-despacho-summary__list">
          {kit.map((h) => (
            <li key={h.herramientaId}>
              {h.nombre} × {draft.herramientas.get(h.herramientaId) ?? h.cantidad}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
