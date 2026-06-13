import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  type AsignacionActiva,
  actualizarEstadoDespachoAsignacion,
  cerrarIncidenteDespacho,
  fetchAsignacionesIncidente,
  liberarAsignacion,
  liberarAsignacionesIncidente,
} from '../../api';
import {
  accionEstadoDespachoLabel,
  estadoDespachoCardClass,
  estadoDespachoLabel,
  estadoIncidenteLabel,
  siguienteEstadoDespacho,
} from '../despacho/despachoLabels';

type CierreMotivo = 'resuelto' | 'falsa_alarma' | 'error';

interface IncidenteOperacionPanelProps {
  incidenteId: string;
  incidenteEstado: string;
  incidenteFolio?: string;
  canManage: boolean;
  onUpdated?: () => void;
  onAssignClick?: () => void;
  compact?: boolean;
}

export default function IncidenteOperacionPanel({
  incidenteId,
  incidenteEstado,
  incidenteFolio,
  canManage,
  onUpdated,
  onAssignClick,
  compact = false,
}: IncidenteOperacionPanelProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [globalBusy, setGlobalBusy] = useState(false);
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [cierreMotivo, setCierreMotivo] = useState<CierreMotivo>('resuelto');

  const cerrado = incidenteEstado === 'CERRADO';

  const loadAsignaciones = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAsignacionesIncidente(incidenteId)
      .then(setAsignaciones)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar asignaciones'))
      .finally(() => setLoading(false));
  }, [incidenteId]);

  useEffect(() => {
    loadAsignaciones();
  }, [loadAsignaciones]);

  const notifyUpdated = () => {
    loadAsignaciones();
    onUpdated?.();
  };

  const handleAvanzar = async (asignacion: AsignacionActiva) => {
    const siguiente = siguienteEstadoDespacho(asignacion.estadoDespacho);
    if (!siguiente) return;
    setActionId(asignacion.id);
    try {
      await actualizarEstadoDespachoAsignacion(asignacion.id, siguiente);
      notifyUpdated();
    } finally {
      setActionId(null);
    }
  };

  const handleLiberar = async (asignacionId: number) => {
    setActionId(asignacionId);
    try {
      await liberarAsignacion(asignacionId);
      notifyUpdated();
    } finally {
      setActionId(null);
    }
  };

  const handleLiberarTodas = async () => {
    setGlobalBusy(true);
    try {
      await liberarAsignacionesIncidente(incidenteId);
      notifyUpdated();
    } finally {
      setGlobalBusy(false);
    }
  };

  const handleCerrar = async () => {
    setGlobalBusy(true);
    try {
      await cerrarIncidenteDespacho(incidenteId);
      setShowCerrarModal(false);
      notifyUpdated();
    } finally {
      setGlobalBusy(false);
    }
  };

  if (!canManage) return null;

  if (cerrado) {
    return (
      <div className={`rev-incidente-ops${compact ? ' rev-incidente-ops--compact' : ''}`}>
        <p className="text-muted small mb-0">
          <i className="bi bi-check-circle me-1" aria-hidden />
          Incidente cerrado. No hay acciones operativas disponibles.
        </p>
      </div>
    );
  }

  const motivoLabel: Record<CierreMotivo, string> = {
    resuelto: 'Caso resuelto en terreno',
    falsa_alarma: 'Falsa alarma',
    error: 'Error de creación / duplicado',
  };

  return (
    <div className={`rev-incidente-ops${compact ? ' rev-incidente-ops--compact' : ''}`}>
      <header className="rev-incidente-ops__head">
        <div>
          <h3 className="rev-incidente-ops__title">
            <i className="bi bi-sliders" aria-hidden />
            Gestión operativa
          </h3>
          <p className="rev-incidente-ops__meta mb-0">
            {incidenteFolio ?? incidenteId.slice(0, 8)} · {estadoIncidenteLabel(incidenteEstado)}
          </p>
        </div>
        <div className="rev-incidente-ops__head-actions">
          {onAssignClick ? (
            <Button variant="primary" size="sm" onClick={onAssignClick}>
              <i className="bi bi-list-check me-1" aria-hidden />
              Despachar brigada…
            </Button>
          ) : (
            <Link
              to={`/despacho/operacion?incidente=${incidenteId}`}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-speedometer2 me-1" aria-hidden />
              Ir a despacho
            </Link>
          )}
        </div>
      </header>

      {error && (
        <Alert variant="danger" className="small py-2">
          {error}
        </Alert>
      )}

      <section className="rev-incidente-ops__section">
        <h4 className="rev-incidente-ops__section-title">Brigadas asignadas</h4>
        {loading ? (
          <p className="text-muted small d-flex align-items-center gap-2 mb-0">
            <span className="spinner-border spinner-border-sm" role="status" />
            Cargando asignaciones…
          </p>
        ) : asignaciones.length === 0 ? (
          <p className="text-muted small mb-0">Sin brigadas asignadas a este incidente.</p>
        ) : (
          <ul className="rev-incidente-ops__brigadas">
            {asignaciones.map((a) => {
              const accion = accionEstadoDespachoLabel(a.estadoDespacho);
              return (
                <li
                  key={a.id}
                  className={`rev-incidente-ops__brigada ${estadoDespachoCardClass(a.estadoDespacho)}`}
                >
                  <div className="rev-incidente-ops__brigada-info">
                    <strong>{a.brigadaNombre ?? `Brigada #${a.brigadaId}`}</strong>
                    {a.vehiculoPatente && (
                      <Badge bg="secondary" className="ms-1">
                        {a.vehiculoPatente}
                      </Badge>
                    )}
                    <span className="rev-incidente-ops__brigada-estado">
                      {estadoDespachoLabel(a.estadoDespacho)}
                    </span>
                  </div>
                  <div className="rev-incidente-ops__brigada-actions">
                    {accion && (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={actionId === a.id}
                        onClick={() => handleAvanzar(a)}
                      >
                        {actionId === a.id ? '…' : accion}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-warning"
                      disabled={actionId === a.id}
                      onClick={() => handleLiberar(a.id)}
                    >
                      Liberar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rev-incidente-ops__section rev-incidente-ops__section--cierre">
        <h4 className="rev-incidente-ops__section-title">Cierre y liberación</h4>
        <p className="small text-muted mb-2">
          Use estas acciones cuando el caso quedó resuelto, fue falsa alarma o se creó por error.
        </p>
        <div className="rev-incidente-ops__cierre-actions">
          {asignaciones.length > 0 && (
            <Button
              variant="outline-warning"
              size="sm"
              disabled={globalBusy}
              onClick={handleLiberarTodas}
            >
              Liberar todas las brigadas
            </Button>
          )}
          <Button
            variant="outline-danger"
            size="sm"
            disabled={globalBusy}
            onClick={() => setShowCerrarModal(true)}
          >
            <i className="bi bi-x-circle me-1" aria-hidden />
            Cerrar incidente
          </Button>
        </div>
      </section>

      <Modal show={showCerrarModal} onHide={() => !globalBusy && setShowCerrarModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cerrar incidente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small">
            Esta acción cerrará el caso
            {asignaciones.length > 0 ? ' y liberará todas las brigadas asignadas' : ''}.
            Confirme el motivo:
          </p>
          <div className="d-flex flex-column gap-2">
            {(Object.keys(motivoLabel) as CierreMotivo[]).map((key) => (
              <label key={key} className="rev-incidente-ops__motivo-option">
                <input
                  type="radio"
                  name="cierreMotivo"
                  checked={cierreMotivo === key}
                  onChange={() => setCierreMotivo(key)}
                />
                {motivoLabel[key]}
              </label>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={globalBusy} onClick={() => setShowCerrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" disabled={globalBusy} onClick={handleCerrar}>
            {globalBusy ? 'Cerrando…' : `Cerrar (${motivoLabel[cierreMotivo]})`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

}
