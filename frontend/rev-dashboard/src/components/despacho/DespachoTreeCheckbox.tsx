import { Form } from 'react-bootstrap';
import type { DespachoBrigadaDraft } from '../../utils/despachoWizardState';

interface DespachoTreeCheckboxProps {
  draft: DespachoBrigadaDraft;
  editable?: boolean;
  onChange?: (draft: DespachoBrigadaDraft) => void;
}

function cloneDraft(d: DespachoBrigadaDraft): DespachoBrigadaDraft {
  return {
    ...d,
    brigadistaIds: new Set(d.brigadistaIds),
    vehiculoIds: new Set(d.vehiculoIds),
    herramientas: new Map(d.herramientas),
  };
}

export default function DespachoTreeCheckbox({
  draft,
  editable = true,
  onChange,
}: DespachoTreeCheckboxProps) {
  const emit = (next: DespachoBrigadaDraft) => onChange?.(next);

  const toggleBrigadista = (id: number, checked: boolean) => {
    if (!editable) return;
    const next = cloneDraft(draft);
    if (checked) next.brigadistaIds.add(id);
    else next.brigadistaIds.delete(id);
    emit(next);
  };

  const toggleVehiculo = (id: number, checked: boolean) => {
    if (!editable) return;
    const next = cloneDraft(draft);
    if (checked) {
      next.vehiculoIds.add(id);
      if (!next.principalVehiculoId) next.principalVehiculoId = id;
    } else {
      next.vehiculoIds.delete(id);
      if (next.principalVehiculoId === id) {
        next.principalVehiculoId = next.vehiculoIds.size ? [...next.vehiculoIds][0] : null;
      }
    }
    emit(next);
  };

  const toggleHerramienta = (id: number, checked: boolean, cantidad: number) => {
    if (!editable) return;
    const next = cloneDraft(draft);
    if (checked) next.herramientas.set(id, cantidad);
    else next.herramientas.delete(id);
    emit(next);
  };

  const vehiculos =
    draft.detalle.vehiculos?.length
      ? draft.detalle.vehiculos
      : draft.detalle.vehiculo
        ? [
            {
              vehiculoId: draft.detalle.vehiculo.id,
              patente: draft.detalle.vehiculo.patente,
              tipo: draft.detalle.vehiculo.tipo,
              principal: true,
            },
          ]
        : [];

  return (
    <div className="rev-despacho-tree">
      <div className="rev-despacho-tree__group-head rev-recursos-table__group">
        <span className="rev-despacho-tree__group-title">{draft.nombre}</span>
        {!draft.listaParaDespacho && (
          <span className="badge bg-warning text-dark ms-2">Dotación incompleta</span>
        )}
      </div>

      <div className="rev-despacho-tree__section">
        <div className="rev-despacho-tree__section-label">Integrantes</div>
        {draft.detalle.brigadistas.map((b) => (
          <Form.Check
            key={b.id}
            type="checkbox"
            className="rev-despacho-tree__leaf"
            id={`dt-b-${draft.brigadaId}-${b.id}`}
            label={`${b.nombre} ${b.apellido}${b.rolNombre ? ` (${b.rolNombre})` : ''}`}
            checked={draft.brigadistaIds.has(b.id)}
            disabled={!editable}
            onChange={(e) => toggleBrigadista(b.id, e.target.checked)}
          />
        ))}
      </div>

      <div className="rev-despacho-tree__section">
        <div className="rev-despacho-tree__section-label">Vehículos</div>
        {vehiculos.map((v) => (
          <Form.Check
            key={v.vehiculoId}
            type="checkbox"
            className="rev-despacho-tree__leaf"
            id={`dt-v-${draft.brigadaId}-${v.vehiculoId}`}
            label={`${v.patente ?? v.vehiculoId} ${v.tipo ? `· ${v.tipo}` : ''}`}
            checked={draft.vehiculoIds.has(v.vehiculoId)}
            disabled={!editable}
            onChange={(e) => toggleVehiculo(v.vehiculoId, e.target.checked)}
          />
        ))}
      </div>

      <div className="rev-despacho-tree__section">
        <div className="rev-despacho-tree__section-label">Kit operativo</div>
        {draft.detalle.herramientas.map((h) => (
          <Form.Check
            key={h.herramientaId}
            type="checkbox"
            className="rev-despacho-tree__leaf"
            id={`dt-h-${draft.brigadaId}-${h.herramientaId}`}
            label={`${h.nombre} × ${h.cantidad}`}
            checked={draft.herramientas.has(h.herramientaId)}
            disabled={!editable}
            onChange={(e) => toggleHerramienta(h.herramientaId, e.target.checked, h.cantidad)}
          />
        ))}
      </div>
    </div>
  );
}
