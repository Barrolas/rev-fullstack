import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Form, ListGroup } from 'react-bootstrap';
import {
  AsignarRecurso,
  BrigadaDetalle,
  RecursosDisponibles,
  asignarRecurso,
  fetchBrigadaDetalle,
  fetchRecursos,
} from '../../api';
import { useAuth } from '../../hooks/useAuth';
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
  const { username, displayName } = useAuth();
  const [recursos, setRecursos] = useState<RecursosDisponibles | null>(null);
  const [brigadaId, setBrigadaId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [detalle, setDetalle] = useState<BrigadaDetalle | null>(null);
  const [detalleError, setDetalleError] = useState('');
  const [usarComposicion, setUsarComposicion] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    if (!show) return;
    setBrigadaId('');
    setVehiculoId('');
    setDetalle(null);
    setDetalleError('');
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
      setVehiculoId('');
      setDetalleError('');
      return;
    }
    setLoadingDetalle(true);
    setDetalleError('');
    fetchBrigadaDetalle(Number(brigadaId))
      .then((d) => {
        setDetalle(d);
        const principal =
          d.vehiculos?.find((v) => v.principal)?.vehiculoId ?? d.vehiculoId ?? d.vehiculos?.[0]?.vehiculoId;
        setVehiculoId(principal != null ? String(principal) : '');
      })
      .catch((e) => {
        setDetalle(null);
        setDetalleError(e instanceof Error ? e.message : 'No se pudo cargar la brigada');
      })
      .finally(() => setLoadingDetalle(false));
  }, [brigadaId]);

  const vehiculosOpciones = useMemo(() => {
    if (!detalle?.vehiculos?.length) {
      return detalle?.vehiculo
        ? [{ id: detalle.vehiculo.id, label: `${detalle.vehiculo.patente} — ${detalle.vehiculo.tipo}` }]
        : [];
    }
    return detalle.vehiculos.map((v) => ({
      id: v.vehiculoId,
      label: `${v.patente ?? 'Vehículo'} — ${v.tipo ?? ''} (${v.capacidadPasajeros ?? '?'} pasajeros)`,
    }));
  }, [detalle]);

  const requiereElegirVehiculo = vehiculosOpciones.length > 1;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brigadaId) return;
    if (usarComposicion && requiereElegirVehiculo && !vehiculoId) {
      setError('Seleccione el vehículo de salida para esta brigada');
      return;
    }
    setAssigning(true);
    setError('');
    try {
      const payload: AsignarRecurso = {
        incidenteId,
        brigadaId: Number(brigadaId),
        usarComposicionBrigada: usarComposicion,
        despachadoPor: displayName || username || 'despachador',
      };
      if (vehiculoId) {
        payload.vehiculoId = Number(vehiculoId);
      } else if (!usarComposicion && detalle?.vehiculoId) {
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

  const brigadasListas = recursos?.brigadas.filter((b) => b.estado === 'DISPONIBLE') ?? [];

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

          {loadingDetalle && brigadaId && (
            <p className="text-muted small">Cargando composición...</p>
          )}

          {detalleError && (
            <Alert variant="danger" className="small py-2">
              {detalleError}
            </Alert>
          )}

          {detalle && usarComposicion && (
            <div className="rev-despacho-preview rev-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="small">Composición a despachar</strong>
                <Badge bg={detalle.listaParaDespacho ? 'success' : 'warning'}>
                  {detalle.listaParaDespacho ? 'Lista' : 'Incompleta'}
                </Badge>
              </div>
              {detalle.jefe && (
                <p className="small mb-2">
                  <i className="bi bi-star me-1" />
                  Jefe: {detalle.jefe.nombre} {detalle.jefe.apellido}
                </p>
              )}
              {requiereElegirVehiculo && (
                <Form.Group className="mb-2">
                  <Form.Label className="small">Vehículo de salida *</Form.Label>
                  <Form.Select
                    size="sm"
                    value={vehiculoId}
                    onChange={(e) => setVehiculoId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {vehiculosOpciones.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <ListGroup variant="flush" className="small">
                <ListGroup.Item className="bg-transparent text-light px-0 border-0">
                  <i className="bi bi-truck me-1" />
                  {detalle.vehiculo
                    ? `${detalle.vehiculo.patente} — ${detalle.vehiculo.tipo}`
                    : 'Sin vehículo asignado'}
                  {detalle.vehiculos && detalle.vehiculos.length > 1 && (
                    <span className="text-muted ms-1">({detalle.vehiculos.length} en dotación)</span>
                  )}
                </ListGroup.Item>
                {detalle.brigadistas.map((b) => (
                  <ListGroup.Item
                    key={b.id}
                    className="bg-transparent text-light px-0 border-0"
                  >
                    <i className="bi bi-person me-1" />
                    {b.nombre} {b.apellido}
                    {b.rolNombre && (
                      <Badge bg="secondary" className="ms-1">
                        {b.rolNombre}
                      </Badge>
                    )}
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
                  Configure la dotación en Recursos → Administración → Dotación (jefe, integrantes,
                  vehículos y kit).
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
              disabled={
                assigning ||
                loadingDetalle ||
                !!detalleError ||
                (usarComposicion && detalle != null && !detalle.listaParaDespacho)
              }
            >
              {assigning ? 'Despachando…' : 'Despachar brigada'}
            </Button>
          </div>
        </Form>
      )}
    </RevModal>
  );
}
