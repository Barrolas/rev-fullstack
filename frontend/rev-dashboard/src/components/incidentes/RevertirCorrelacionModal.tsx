import { useEffect, useState } from 'react';
import { Alert, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  CorrelacionItem,
  RevertirCorrelacionPreview,
  fetchRevertirCorrelacionPreview,
  revertirCorrelacion,
} from '../../api';

interface RevertirCorrelacionModalProps {
  correlacion: CorrelacionItem | null;
  show: boolean;
  onClose: () => void;
  onDone: () => void;
}

export default function RevertirCorrelacionModal({
  correlacion,
  show,
  onClose,
  onDone,
}: RevertirCorrelacionModalProps) {
  const [preview, setPreview] = useState<RevertirCorrelacionPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show || !correlacion) {
      setPreview(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchRevertirCorrelacionPreview(correlacion.id)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar la vista previa');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [show, correlacion]);

  const handleRevertir = async (reasignarAsignacionesA?: string) => {
    if (!correlacion) return;
    setBusy(true);
    setError('');
    try {
      await revertirCorrelacion(
        correlacion.id,
        reasignarAsignacionesA ? { reasignarAsignacionesA } : undefined,
      );
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo deshacer la correlación');
    } finally {
      setBusy(false);
    }
  };

  const folioDesvinculado = preview?.reporteDesvinculado.folio ?? 'reporte vinculado';
  const folioCanonico = preview?.canonico.folio ?? 'canónico';

  return (
    <Modal show={show} onHide={onClose} centered className="rev-modal">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>Deshacer correlación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center py-3">
            <Spinner size="sm" animation="border" /> Cargando…
          </div>
        )}
        {!loading && preview && (
          <>
            <p className="small text-muted mb-3">
              Se desvinculará <strong>{folioDesvinculado}</strong> del grupo cuyo canónico es{' '}
              <strong>{folioCanonico}</strong>. La sugerencia volverá a estado pendiente para
              revisión.
            </p>

            {preview.bloqueado && (
              <>
                <Alert variant="warning" className="small">
                  Hay brigadas activas despachadas al incidente canónico. Debe reasignarlas antes
                  de deshacer la correlación.
                </Alert>
                <ListGroup variant="flush" className="mb-3 small">
                  {preview.asignacionesActivas.map((a) => (
                    <ListGroup.Item key={a.id} className="bg-transparent px-0 text-light">
                      {a.brigadaNombre ?? `Brigada ${a.brigadaId}`}
                      <span className="text-muted ms-2">{a.estadoDespacho}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <p className="small mb-3">
                  Puede reasignar las brigadas a{' '}
                  <Link to={`/incidentes/${preview.reporteDesvinculado.id}`}>
                    {folioDesvinculado}
                  </Link>{' '}
                  (quedará como incidente independiente) y deshacer en un solo paso.
                </p>
              </>
            )}
          </>
        )}
        {error && (
          <Alert variant="danger" className="small mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        {preview && !preview.bloqueado && (
          <Button variant="danger" disabled={busy || loading} onClick={() => handleRevertir()}>
            {busy ? 'Procesando…' : 'Deshacer correlación'}
          </Button>
        )}
        {preview?.bloqueado && (
          <>
            <Link
              to={`/incidentes/${preview.canonico.id}`}
              className="btn btn-outline-primary"
              onClick={onClose}
            >
              Ir al canónico
            </Link>
            <Button
              variant="danger"
              disabled={busy || loading}
              onClick={() => handleRevertir(preview.incidenteDestinoSugerido)}
            >
              {busy ? 'Procesando…' : `Reasignar a ${folioDesvinculado} y deshacer`}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
