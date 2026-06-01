import { FormEvent, useEffect, useState } from 'react';
import { Alert, Badge, Button, Form, ListGroup } from 'react-bootstrap';
import {
  AsignarRecurso,
  BrigadaDetalle,
  RecursosDisponibles,
  asignarRecurso,
  fetchBrigadaDetalle,
  fetchRecursos,
} from '../../api';
import RevModal from '../primitives/RevModal';

interface AssignResourceModalProps {
  show: boolean;
  incidenteId: string;
  onHide: () => void;
  onAssigned: () => void;
}

export default function AssignResourceModal({
  show,
  incidenteId,
  onHide,
  onAssigned,
}: AssignResourceModalProps) {
  const [recursos, setRecursos] = useState<RecursosDisponibles | null>(null);
  const [brigadaId, setBrigadaId] = useState('');
  const [detalle, setDetalle] = useState<BrigadaDetalle | null>(null);
  const [usarComposicion, setUsarComposicion] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!show) return;
    setBrigadaId('');
    setDetalle(null);
    setUsarComposicion(true);
    setError('');
    setLoading(true);
    fetchRecursos()
      .then(setRecursos)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar recursos'))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(() => {
    if (!brigadaId) {
      setDetalle(null);
      return;
    }
    fetchBrigadaDetalle(Number(brigadaId))
      .then(setDetalle)
      .catch(() => setDetalle(null));
  }, [brigadaId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brigadaId) return;
    setAssigning(true);
    setError('');
    try {
      const payload: AsignarRecurso = {
        incidenteId,
        brigadaId: Number(brigadaId),
        usarComposicionBrigada: usarComposicion,
      };
      if (!usarComposicion && detalle?.vehiculoId) {
        payload.vehiculoId = detalle.vehiculoId;
      }
      await asignarRecurso(payload);
      onAssigned();
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar');
    } finally {
      setAssigning(false);
    }
  };

  const brigadasListas =
    recursos?.brigadas.filter((b) => b.estado === 'DISPONIBLE') ?? [];

  return (
    <RevModal show={show} onHide={onHide} title="Despachar brigada" size="lg">
      {loading ? (
        <p className="text-muted mb-0">Cargando recursos...</p>
      ) : (
        <Form onSubmit={handleSubmit}>
          <p className="text-muted small">
            Se despachará la brigada con su vehículo, brigadistas y herramientas configurados en
            el módulo Recursos.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Brigada *</Form.Label>
            <Form.Select
              value={brigadaId}
              onChange={(e) => setBrigadaId(e.target.value)}
              required
            >
              <option value="">Seleccionar brigada...</option>
              {brigadasListas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} (cap. {b.capacidad})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="switch"
            id="usar-composicion"
            className="mb-3"
            label="Despachar kit completo de la brigada (recomendado)"
            checked={usarComposicion}
            onChange={(e) => setUsarComposicion(e.target.checked)}
          />

          {detalle && usarComposicion && (
            <div className="rev-despacho-preview rev-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="small">Composición a despachar</strong>
                <Badge bg={detalle.listaParaDespacho ? 'success' : 'warning'}>
                  {detalle.listaParaDespacho ? 'Lista' : 'Incompleta'}
                </Badge>
              </div>
              <ListGroup variant="flush" className="small">
                <ListGroup.Item className="bg-transparent text-light px-0 border-0">
                  <i className="bi bi-truck me-1" />
                  {detalle.vehiculo
                    ? `${detalle.vehiculo.patente} — ${detalle.vehiculo.tipo}`
                    : 'Sin vehículo asignado'}
                </ListGroup.Item>
                {detalle.brigadistas.map((b) => (
                  <ListGroup.Item
                    key={b.id}
                    className="bg-transparent text-light px-0 border-0"
                  >
                    <i className="bi bi-person me-1" />
                    {b.nombre} {b.apellido}
                    <Badge bg="secondary" className="ms-1">
                      {b.estado}
                    </Badge>
                  </ListGroup.Item>
                ))}
                {detalle.herramientas.map((h) => (
                  <ListGroup.Item
                    key={h.herramientaId}
                    className="bg-transparent text-light px-0 border-0"
                  >
                    <i className="bi bi-tools me-1" />
                    {h.nombre} × {h.cantidad}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {!detalle.listaParaDespacho && (
                <Alert variant="warning" className="small mt-2 mb-0 py-2">
                  Configure la composición en Recursos → Administración antes de despachar.
                </Alert>
              )}
            </div>
          )}

          {error && <p className="text-danger small">{error}</p>}
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" onClick={onHide} disabled={assigning}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={assigning || (usarComposicion && detalle != null && !detalle.listaParaDespacho)}
            >
              {assigning ? 'Despachando…' : 'Despachar brigada'}
            </Button>
          </div>
        </Form>
      )}
    </RevModal>
  );
}
