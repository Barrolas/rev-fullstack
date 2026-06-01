import { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import {
  BrigadaComposicionPayload,
  BrigadaDetalle,
  RecursosCatalogo,
  fetchBrigadaDetalle,
  updateBrigadaComposicion,
} from '../../api';
import RevModal from '../primitives/RevModal';

interface BrigadaComposicionModalProps {
  show: boolean;
  brigadaId: number | null;
  catalogo: RecursosCatalogo | null;
  onHide: () => void;
  onSaved: () => void;
}

export default function BrigadaComposicionModal({
  show,
  brigadaId,
  catalogo,
  onHide,
  onSaved,
}: BrigadaComposicionModalProps) {
  const [detalle, setDetalle] = useState<BrigadaDetalle | null>(null);
  const [vehiculoId, setVehiculoId] = useState('');
  const [brigadistaIds, setBrigadistaIds] = useState<number[]>([]);
  const [herramientas, setHerramientas] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show || brigadaId == null) return;
    setLoading(true);
    setError('');
    fetchBrigadaDetalle(brigadaId)
      .then((d) => {
        setDetalle(d);
        setVehiculoId(d.vehiculoId != null ? String(d.vehiculoId) : '');
        setBrigadistaIds(d.brigadistas.map((b) => b.id));
        const map: Record<number, number> = {};
        d.herramientas.forEach((h) => {
          map[h.herramientaId] = h.cantidad;
        });
        setHerramientas(map);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar brigada'))
      .finally(() => setLoading(false));
  }, [show, brigadaId]);

  const toggleBrigadista = (id: number) => {
    setBrigadistaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const setHerramientaCantidad = (id: number, cantidad: number) => {
    setHerramientas((prev) => {
      const next = { ...prev };
      if (cantidad <= 0) delete next[id];
      else next[id] = cantidad;
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (brigadaId == null) return;
    setSaving(true);
    setError('');
    try {
      const payload: BrigadaComposicionPayload = {
        vehiculoId: vehiculoId ? Number(vehiculoId) : null,
        brigadistaIds,
        herramientas: Object.entries(herramientas).map(([hid, cantidad]) => ({
          herramientaId: Number(hid),
          cantidad,
        })),
      };
      await updateBrigadaComposicion(brigadaId, payload);
      onSaved();
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const capacidad = detalle?.capacidad ?? 0;

  return (
    <RevModal
      show={show}
      onHide={onHide}
      title={detalle ? `Composición: ${detalle.nombre}` : 'Composición de brigada'}
      size="lg"
    >
      {loading ? (
        <p className="text-muted mb-0">Cargando…</p>
      ) : (
        <Form onSubmit={handleSubmit}>
          <p className="text-muted small">
            Defina vehículo, brigadistas (máx. {capacidad}) y kit de herramientas. Al despachar se
            asignará esta composición al incidente.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Vehículo asignado a la brigada</Form.Label>
            <Form.Select value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}>
              <option value="">Sin vehículo</option>
              {catalogo?.vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} — {v.tipo} ({v.estado})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Brigadistas</Form.Label>
            <div className="rev-composicion-checklist">
              {catalogo?.brigadistas.map((b) => (
                <Form.Check
                  key={b.id}
                  type="checkbox"
                  id={`brigadista-${b.id}`}
                  label={`${b.nombre} ${b.apellido}${b.especialidad ? ` · ${b.especialidad}` : ''} (${b.estado})`}
                  checked={brigadistaIds.includes(b.id)}
                  disabled={!brigadistaIds.includes(b.id) && brigadistaIds.length >= capacidad}
                  onChange={() => toggleBrigadista(b.id)}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Herramientas del kit</Form.Label>
            {catalogo?.herramientas.map((h) => (
              <div key={h.id} className="d-flex align-items-center gap-2 mb-2">
                <span className="flex-grow-1 small">{h.nombre}</span>
                <span className="text-muted small">disp. {h.cantidadDisponible}</span>
                <Form.Control
                  type="number"
                  min={0}
                  max={h.cantidadDisponible}
                  style={{ width: '5rem' }}
                  value={herramientas[h.id] ?? 0}
                  onChange={(e) => setHerramientaCantidad(h.id, Number(e.target.value))}
                />
              </div>
            ))}
          </Form.Group>

          {detalle && (
            <Alert variant={detalle.listaParaDespacho ? 'success' : 'warning'} className="small py-2">
              {detalle.listaParaDespacho
                ? 'Brigada lista para despacho (todos los recursos disponibles).'
                : 'Tras guardar, verifique disponibilidad de vehículo, brigadistas y stock.'}
            </Alert>
          )}

          {error && <p className="text-danger small">{error}</p>}

          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar composición'}
            </Button>
          </div>
        </Form>
      )}
    </RevModal>
  );
}
