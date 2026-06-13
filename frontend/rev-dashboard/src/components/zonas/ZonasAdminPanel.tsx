import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import {
  createZona,
  deactivateZona,
  fetchZonas,
  recalcularZonasIncidentes,
  updateZona,
  type Zona,
  type ZonaPayload,
} from '../../api';
import { VALLE_DEL_SOL_CENTER } from '../../utils/mapConfig';
import { riskVariant } from '../RiskBadge';
import StateView from '../primitives/StateView';
import ZonaAdminMap from './ZonaAdminMap';

const EMPTY_FORM: ZonaPayload = {
  nombre: '',
  nivelRiesgo: 'MEDIUM',
  centerLat: VALLE_DEL_SOL_CENTER[0],
  centerLng: VALLE_DEL_SOL_CENTER[1],
  radioMetros: 1200,
  comuna: 'Puente Alto',
  tipo: 'ESTRATEGICA',
};

function payloadForApi(form: ZonaPayload): ZonaPayload {
  return {
    ...form,
    nombre: form.nombre.trim(),
    nivelRiesgo: form.nivelRiesgo.toUpperCase(),
    comuna: form.comuna?.trim() || 'Puente Alto',
    tipo: form.tipo?.trim() || 'ESTRATEGICA',
    radioMetros: Math.min(15_000, Math.max(200, form.radioMetros)),
  };
}

interface ZonasAdminPanelProps {
  onChanged?: () => void;
}

export default function ZonasAdminPanel({ onChanged }: ZonasAdminPanelProps) {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ZonaPayload>({ ...EMPTY_FORM });
  const [showInactivas, setShowInactivas] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchZonas(showInactivas);
      setZonas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar zonas');
    } finally {
      setLoading(false);
    }
  }, [showInactivas]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const startEdit = (z: Zona) => {
    setEditingId(z.id);
    setForm({
      nombre: z.nombre,
      nivelRiesgo: z.nivelRiesgo,
      centerLat: z.centerLat ?? VALLE_DEL_SOL_CENTER[0],
      centerLng: z.centerLng ?? VALLE_DEL_SOL_CENTER[1],
      radioMetros: z.radioMetros ?? 1200,
      comuna: z.comuna ?? 'Puente Alto',
      tipo: z.tipo ?? 'ESTRATEGICA',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const payload = payloadForApi(form);
    try {
      if (editingId != null) {
        await updateZona(editingId, payload);
        setMessage('Zona actualizada.');
      } else {
        await createZona(payload);
        setMessage('Zona creada.');
      }
      resetForm();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la zona');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('¿Desactivar esta zona? Los incidentes históricos conservan su asignación.')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      await deactivateZona(id);
      setMessage('Zona desactivada.');
      if (editingId === id) resetForm();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalcular = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await recalcularZonasIncidentes();
      setMessage(`Recalculadas ${res.actualizados} asignaciones de zona.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al recalcular');
    } finally {
      setSaving(false);
    }
  };

  const activas = zonas.filter((z) => z.activa !== false);
  const inactivas = zonas.filter((z) => z.activa === false);

  return (
    <div className="rev-zones-admin">
      <div className="rev-zones-admin__header rev-zones-admin__section-pad">
        <p className="text-muted mb-0 small">
          Municipalidad de Valle del Sol — <strong>Puente Alto</strong>. Un solo mapa: clic para el
          centro y círculo según el radio (metros).
        </p>
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Form.Check
            type="switch"
            id="zonas-inactivas"
            label="Mostrar inactivas"
            checked={showInactivas}
            onChange={(e) => setShowInactivas(e.target.checked)}
          />
          <Button variant="outline-secondary" size="sm" onClick={load} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1" />
            Actualizar
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleRecalcular} disabled={saving}>
            Recalcular incidentes
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant="success" className="rev-zones-admin__alert">
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="rev-zones-admin__alert">
          {error}
        </Alert>
      )}

      <Row
        className={`g-3 rev-zones-admin__editor-row${mapExpanded ? ' rev-zones-admin__editor-row--stacked' : ''}`}
      >
        <Col xs={12} lg={mapExpanded ? 12 : 4} className="rev-zones-admin__form-col">
          <div className="rev-card rev-zones-admin__form-card">
            <h2 className="h6">{editingId != null ? 'Editar zona' : 'Nueva zona'}</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nivel de riesgo</Form.Label>
                <Form.Select
                  value={form.nivelRiesgo}
                  onChange={(e) => setForm((f) => ({ ...f, nivelRiesgo: e.target.value }))}
                >
                  <option value="LOW">Bajo</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="HIGH">Alto</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Radio (metros)</Form.Label>
                <Form.Control
                  type="number"
                  min={200}
                  max={15000}
                  step={50}
                  value={form.radioMetros}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, radioMetros: Number(e.target.value) || 200 }))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Coordenadas</Form.Label>
                <div className="rev-zones-admin__coords small text-muted">
                  <span>
                    Lat {form.centerLat.toFixed(5)} · Lng {form.centerLng.toFixed(5)}
                  </span>
                </div>
              </Form.Group>
              <div className="d-flex flex-wrap gap-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {editingId != null ? 'Guardar cambios' : 'Crear zona'}
                </Button>
                {editingId != null && (
                  <Button type="button" variant="outline-secondary" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </Col>

        <Col xs={12} lg={mapExpanded ? 12 : 8} className="rev-zones-admin__map-col">
          <div className="rev-card rev-zones-admin__map-card">
            <h2 className="h6">Mapa de la zona</h2>
            <ZonaAdminMap
              centerLat={form.centerLat}
              centerLng={form.centerLng}
              radioMetros={form.radioMetros}
              nivelRiesgo={form.nivelRiesgo}
              layoutExpanded={mapExpanded}
              onLayoutExpandedChange={setMapExpanded}
              onCenterChange={(lat, lng) =>
                setForm((f) => ({ ...f, centerLat: lat, centerLng: lng }))
              }
              disabled={saving}
            />
          </div>
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col xs={12}>
          <StateView state={loading ? 'loading' : 'idle'} loadingMessage="Cargando zonas…">
            <div className="rev-card rev-zones-admin__list-card">
              <h2 className="h6">Zonas activas ({activas.length})</h2>
              <ul className="list-group list-group-flush mb-4">
                {activas.map((z) => (
                  <li
                    key={z.id}
                    className={`list-group-item d-flex justify-content-between align-items-center rev-zones-admin__item--${riskVariant(z.nivelRiesgo)}`}
                  >
                    <div>
                      <strong>{z.nombre}</strong>
                      <div className="small text-muted">
                        {z.nivelRiesgo} · {z.radioMetros ?? '—'} m
                        {z.comuna && ` · ${z.comuna}`}
                      </div>
                    </div>
                    <div className="btn-group btn-group-sm">
                      <Button variant="outline-primary" onClick={() => startEdit(z)}>
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeactivate(z.id)}
                        disabled={saving}
                      >
                        Desactivar
                      </Button>
                    </div>
                  </li>
                ))}
                {activas.length === 0 && (
                  <li className="list-group-item text-muted">No hay zonas activas.</li>
                )}
              </ul>

              {inactivas.length > 0 && (
                <>
                  <h2 className="h6 text-muted">Inactivas ({inactivas.length})</h2>
                  <ul className="list-group list-group-flush">
                    {inactivas.map((z) => (
                      <li key={z.id} className="list-group-item text-muted">
                        <strong>{z.nombre}</strong>
                        <span className="small ms-2">(desactivada)</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </StateView>
        </Col>
      </Row>
    </div>
  );
}
