import { FormEvent, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { AsignarRecurso, RecursosDisponibles, asignarRecurso, fetchRecursos } from '../../api';
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
  const [vehiculoId, setVehiculoId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!show) return;
    setBrigadaId('');
    setVehiculoId('');
    setError('');
    setLoading(true);
    fetchRecursos()
      .then(setRecursos)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar recursos'))
      .finally(() => setLoading(false));
  }, [show]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brigadaId) return;
    setAssigning(true);
    setError('');
    try {
      const payload: AsignarRecurso = {
        incidenteId,
        brigadaId: Number(brigadaId),
      };
      if (vehiculoId) payload.vehiculoId = Number(vehiculoId);
      await asignarRecurso(payload);
      onAssigned();
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <RevModal show={show} onHide={onHide} title="Asignar recurso">
      {loading ? (
        <p className="text-muted mb-0">Cargando recursos...</p>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Brigada *</Form.Label>
            <Form.Select
              value={brigadaId}
              onChange={(e) => setBrigadaId(e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              {recursos?.brigadas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} (cap. {b.capacidad})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vehiculo (opcional)</Form.Label>
            <Form.Select value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}>
              <option value="">Ninguno</option>
              {recursos?.vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} — {v.tipo}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {error && <p className="text-danger small">{error}</p>}
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="outline-secondary" onClick={onHide} disabled={assigning}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={assigning}>
              {assigning ? 'Asignando...' : 'Asignar'}
            </Button>
          </div>
        </Form>
      )}
    </RevModal>
  );
}
