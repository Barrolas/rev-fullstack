import { Fragment, useCallback, useState } from 'react';
import { Alert, Badge, Button, Nav, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  CorrelacionEstado,
  CorrelacionItem,
  confirmarCorrelacion,
  descartarCorrelacion,
  fetchCorrelaciones,
  reabrirCorrelacion,
} from '../../api';
import CorrelationPairMap from './CorrelationPairMap';
import RevertirCorrelacionModal from './RevertirCorrelacionModal';
import StateView from '../primitives/StateView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../../hooks/useAuth';

type CorrelacionTab = CorrelacionEstado;

interface IncidentesCorrelacionesPanelProps {
  onResolved?: () => void;
}

function formatFecha(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function folioCanonico(c: CorrelacionItem): string {
  if (!c.incidenteCanonicoId) return '—';
  if (c.incidenteA.id === c.incidenteCanonicoId) return c.incidenteA.folio ?? 'A';
  if (c.incidenteB.id === c.incidenteCanonicoId) return c.incidenteB.folio ?? 'B';
  return c.incidenteCanonicoId.slice(0, 8);
}

export default function IncidentesCorrelacionesPanel({ onResolved }: IncidentesCorrelacionesPanelProps) {
  const { canManageIncidents } = useAuth();
  const [tab, setTab] = useState<CorrelacionTab>('PENDIENTE');
  const fetchFn = useCallback(() => fetchCorrelaciones(tab), [tab]);
  const { data: list, loading, error, refetch } = useApiQuery<CorrelacionItem[]>({ fetchFn });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revertirTarget, setRevertirTarget] = useState<CorrelacionItem | null>(null);

  const items = list ?? [];

  const notifyChange = () => {
    refetch();
    onResolved?.();
  };

  const handleConfirmar = async (c: CorrelacionItem, canonicoId: string) => {
    setBusyId(c.id);
    try {
      await confirmarCorrelacion(c.id, canonicoId);
      notifyChange();
    } finally {
      setBusyId(null);
    }
  };

  const handleDescartar = async (c: CorrelacionItem) => {
    setBusyId(c.id);
    try {
      await descartarCorrelacion(c.id);
      notifyChange();
    } finally {
      setBusyId(null);
    }
  };

  const handleReabrir = async (c: CorrelacionItem) => {
    setBusyId(c.id);
    try {
      await reabrirCorrelacion(c.id);
      notifyChange();
    } finally {
      setBusyId(null);
    }
  };

  const emptyMessages: Record<CorrelacionTab, { title: string; message: string }> = {
    PENDIENTE: {
      title: 'Sin sugerencias',
      message: 'No hay pares de reportes pendientes de revisión.',
    },
    CONFIRMADA: {
      title: 'Sin confirmadas',
      message: 'Aún no hay correlaciones confirmadas en el historial.',
    },
    DESCARTADA: {
      title: 'Sin descartadas',
      message: 'No hay correlaciones descartadas registradas.',
    },
  };

  const empty = emptyMessages[tab];

  const tableState = loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'idle';

  return (
    <>
      <div className="rev-card p-3 rev-incidentes-correlaciones">
        <Alert variant="secondary" className="small mb-3 py-2">
          Confirmar vincula reportes al mismo suceso: uno queda <strong>canónico</strong> (despacho)
          y el otro queda <strong>vinculado</strong>. No se borra ningún folio. El círculo del mapa
          solo se agranda visualmente cuando hay grupo confirmado.
        </Alert>

        <Nav variant="pills" className="mb-3 gap-1 rev-correlaciones-subtabs">
            <Nav.Item>
              <Nav.Link
                active={tab === 'PENDIENTE'}
                onClick={() => setTab('PENDIENTE')}
                eventKey="PENDIENTE"
              >
                Pendientes
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={tab === 'CONFIRMADA'}
                onClick={() => setTab('CONFIRMADA')}
                eventKey="CONFIRMADA"
              >
                Confirmadas
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={tab === 'DESCARTADA'}
                onClick={() => setTab('DESCARTADA')}
                eventKey="DESCARTADA"
              >
                Descartadas
              </Nav.Link>
            </Nav.Item>
          </Nav>

        {tab === 'PENDIENTE' && (
          <p className="text-muted small mb-3">
            Revise reportes cercanos en tiempo y ubicación antes de despachar al incidente
            canónico.
          </p>
        )}

        <StateView
          state={tableState}
          errorMessage={error ?? undefined}
          onRetry={refetch}
          emptyTitle={empty.title}
          emptyMessage={empty.message}
        >
          <div className="table-responsive">
            <Table hover className="rev-data-table rev-data-table--compact align-middle mb-0">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Folios</th>
                  <th>Distancia</th>
                  <th>Tiempo</th>
                  {tab === 'CONFIRMADA' && <th>Canónico</th>}
                  {(tab === 'CONFIRMADA' || tab === 'DESCARTADA') && <th>Decisión</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <Fragment key={c.id}>
                    <tr>
                      <td>
                        <Badge bg={c.score >= 80 ? 'danger' : 'warning'} text="dark">
                          {c.score}
                        </Badge>
                      </td>
                      <td>
                        <Link to={`/incidentes/${c.incidenteA.id}`}>{c.incidenteA.folio}</Link>
                        <span className="mx-1">↔</span>
                        <Link to={`/incidentes/${c.incidenteB.id}`}>{c.incidenteB.folio}</Link>
                        <div className="small text-muted">{c.incidenteA.tipo}</div>
                      </td>
                      <td>{Math.round(c.distanciaMetros)} m</td>
                      <td>{c.deltaMinutos} min</td>
                      {tab === 'CONFIRMADA' && <td>{folioCanonico(c)}</td>}
                      {(tab === 'CONFIRMADA' || tab === 'DESCARTADA') && (
                        <td className="small">
                          <div>{c.decididoPor ?? '—'}</div>
                          <div className="text-muted">{formatFecha(c.decididoAt)}</div>
                        </td>
                      )}
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="me-1"
                          onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        >
                          {expandedId === c.id ? 'Ocultar' : 'Mapa'}
                        </Button>
                        {canManageIncidents && tab === 'PENDIENTE' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              className="me-1"
                              disabled={busyId === c.id}
                              onClick={() => handleConfirmar(c, c.incidenteA.id)}
                              title={`Canónico: ${c.incidenteA.folio}`}
                            >
                              {c.incidenteA.folio}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-1"
                              disabled={busyId === c.id}
                              onClick={() => handleConfirmar(c, c.incidenteB.id)}
                              title={`Canónico: ${c.incidenteB.folio}`}
                            >
                              {c.incidenteB.folio}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              disabled={busyId === c.id}
                              onClick={() => handleDescartar(c)}
                            >
                              Descartar
                            </Button>
                          </>
                        )}
                        {canManageIncidents && tab === 'CONFIRMADA' && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            disabled={busyId === c.id}
                            onClick={() => setRevertirTarget(c)}
                          >
                            Deshacer
                          </Button>
                        )}
                        {canManageIncidents && tab === 'DESCARTADA' && (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            disabled={busyId === c.id}
                            onClick={() => handleReabrir(c)}
                          >
                            Reabrir
                          </Button>
                        )}
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr>
                        <td colSpan={tab === 'PENDIENTE' ? 5 : tab === 'CONFIRMADA' ? 7 : 6}>
                          <CorrelationPairMap
                            pointA={{
                              lat: c.incidenteA.lat ?? 0,
                              lng: c.incidenteA.lng ?? 0,
                              label: c.incidenteA.folio ?? 'A',
                            }}
                            pointB={{
                              lat: c.incidenteB.lat ?? 0,
                              lng: c.incidenteB.lng ?? 0,
                              label: c.incidenteB.folio ?? 'B',
                            }}
                            radioMetros={Number(c.motivo?.radioMetros ?? 400)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </Table>
          </div>
        </StateView>
      </div>

      <RevertirCorrelacionModal
        correlacion={revertirTarget}
        show={revertirTarget != null}
        onClose={() => setRevertirTarget(null)}
        onDone={notifyChange}
      />
    </>
  );
}
