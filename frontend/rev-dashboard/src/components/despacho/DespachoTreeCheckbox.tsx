import { Form } from 'react-bootstrap';
import type { DespachoBrigadaDraft } from '../../utils/despachoWizardState';
import { resolveVehiculos, selectedVehiclesCapacity } from '../../utils/despachoWizardState';

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

  const vehiculos = resolveVehiculos(draft);
  const plazasTotales = selectedVehiclesCapacity(draft);
  const integrantes = draft.brigadistaIds.size;
  const capExcedida = plazasTotales > 0 && integrantes > plazasTotales;

  const setPrincipalVehiculo = (vehiculoId: number) => {
    if (!editable) return;
    const next = cloneDraft(draft);
    if (!next.vehiculoIds.has(vehiculoId)) {
      next.vehiculoIds.add(vehiculoId);
    }
    next.principalVehiculoId = vehiculoId;
    emit(next);
  };

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
        {vehiculos.map((v) => {
          const selected = draft.vehiculoIds.has(v.vehiculoId);
          const isPrincipal = draft.principalVehiculoId === v.vehiculoId;
          const capLabel =
            v.capacidadPasajeros != null ? ` · ${v.capacidadPasajeros} plazas` : '';
          return (
            <div key={v.vehiculoId} className="rev-despacho-tree__veh-row">
              <Form.Check
                type="checkbox"
                className="rev-despacho-tree__leaf"
                id={`dt-v-${draft.brigadaId}-${v.vehiculoId}`}
                label={`${v.patente ?? v.vehiculoId}${v.tipo ? ` · ${v.tipo}` : ''}${capLabel}`}
                checked={selected}
                disabled={!editable}
                onChange={(e) => toggleVehiculo(v.vehiculoId, e.target.checked)}
              />
              {editable && selected && (
                <Form.Check
                  type="radio"
                  className="rev-despacho-tree__principal"
                  name={`dt-principal-${draft.brigadaId}`}
                  id={`dt-principal-${draft.brigadaId}-${v.vehiculoId}`}
                  label="Prioritario"
                  title="Vehículo de salida principal; no limita el total de plazas"
                  checked={isPrincipal}
                  onChange={() => setPrincipalVehiculo(v.vehiculoId)}
                />
              )}
              {!editable && isPrincipal && (
                <span className="rev-despacho-tree__principal-badge">Prioritario</span>
              )}
            </div>
          );
        })}
        {editable && draft.vehiculoIds.size > 0 && (
          <p className="rev-despacho-tree__hint small text-muted mb-0">
            Plazas seleccionadas: <strong>{plazasTotales}</strong>
            {integrantes > 0 && ` · Integrantes: ${integrantes}`}
          </p>
        )}
        {editable && capExcedida && (
          <p className="rev-despacho-tree__warn small text-warning mb-0">
            Integrantes ({integrantes}) superan plazas de los vehículos seleccionados ({plazasTotales}).
          </p>
        )}
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
