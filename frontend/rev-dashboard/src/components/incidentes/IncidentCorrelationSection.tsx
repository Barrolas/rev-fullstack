import { useCallback, useState } from 'react';
import { Alert, Badge, Button, Collapse, ListGroup, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  CorrelacionItem,
  GrupoIncidente,
  confirmarCorrelacion,
  descartarCorrelacion,
  fetchCorrelacionesPorIncidente,
  fetchIncidenteGrupo,
} from '../../api';
import RevertirCorrelacionModal from './RevertirCorrelacionModal';
import { useApiQuery } from '../../hooks/useApiQuery';
import { isLinkedReport } from '../../utils/incidentesFilters';
import type { DashboardItem } from '../../api';
import CorrelationPairMap from './CorrelationPairMap';

interface IncidentCorrelationSectionProps {
  incidenteId: string;
  item: DashboardItem;
  canManage: boolean;
  onUpdated: () => void;
}

function ScoreBreakdown({ motivo }: { motivo: Record<string, unknown> }) {
  const rows = [
    { label: 'Proximidad', value: motivo.puntosDistancia, max: 50 },
    { label: 'Tiempo', value: motivo.puntosTiempo, max: 30 },
    { label: 'Mismo tipo', value: motivo.puntosTipo, max: 20 },
    { label: 'Reporte público', value: motivo.puntosPublico, max: 10 },
  ];
  return (
    <ul className="list-unstyled small mb-0 rev-correlacion-score">
      {rows.map((row) => (
        <li key={row.label} className="d-flex justify-content-between gap-2">
          <span>{row.label}</span>
          <span>
            {String(row.value ?? 0)} / {row.max}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SugerenciaCard({
  sugerencia,
  canManage,
  onResolved,
}: {
  sugerencia: CorrelacionItem;
  canManage: boolean;
  onResolved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async (canonicoId: string) => {
    setBusy(true);
    setError('');
    try {
      await confirmarCorrelacion(sugerencia.id, canonicoId);
      onResolved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo confirmar');
    } finally {
      setBusy(false);
    }
  };

  const descartar = async () => {
    setBusy(true);
    setError('');
    try {
      await descartarCorrelacion(sugerencia.id);
      onResolved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descartar');
    } finally {
      setBusy(false);
    }
  };

  if (sugerencia.estado !== 'PENDIENTE') return null;

  const radio = Number(sugerencia.motivo?.radioMetros ?? 400);

  return (
    <div className="rev-card p-3 mb-3 border-warning border-opacity-50">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
        <div>
          <Badge bg="warning" text="dark" className="me-2">
            Score {sugerencia.score}
          </Badge>
          <span className="small text-muted">
            {Math.round(sugerencia.distanciaMetros)} m · {sugerencia.deltaMinutos} min
          </span>
        </div>
      </div>
      <p className="small mb-2">
        <strong>{sugerencia.incidenteA.folio}</strong> ↔ <strong>{sugerencia.incidenteB.folio}</strong>
      </p>
      <ScoreBreakdown motivo={sugerencia.motivo} />
      <CorrelationPairMap
        pointA={{
          lat: sugerencia.incidenteA.lat ?? 0,
          lng: sugerencia.incidenteA.lng ?? 0,
          label: sugerencia.incidenteA.folio ?? 'A',
        }}
        pointB={{
          lat: sugerencia.incidenteB.lat ?? 0,
          lng: sugerencia.incidenteB.lng ?? 0,
          label: sugerencia.incidenteB.folio ?? 'B',
        }}
        radioMetros={radio}
      />
      {error && <Alert variant="danger" className="mt-2 mb-0 py-2 small">{error}</Alert>}
      {canManage && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          <Button
            size="sm"
            variant="primary"
            disabled={busy}
            onClick={() => confirmar(sugerencia.incidenteA.id)}
          >
            Canónico: {sugerencia.incidenteA.folio}
          </Button>
          <Button
            size="sm"
            variant="outline-primary"
            disabled={busy}
            onClick={() => confirmar(sugerencia.incidenteB.id)}
          >
            Canónico: {sugerencia.incidenteB.folio}
          </Button>
          <Button size="sm" variant="outline-secondary" disabled={busy} onClick={descartar}>
            Descartar
          </Button>
        </div>
      )}
    </div>
  );
}

function formatFecha(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function folioCanonicoDe(c: CorrelacionItem): string {
  if (!c.incidenteCanonicoId) return '—';
  if (c.incidenteA.id === c.incidenteCanonicoId) return c.incidenteA.folio ?? 'A';
  if (c.incidenteB.id === c.incidenteCanonicoId) return c.incidenteB.folio ?? 'B';
  return '—';
}

export default function IncidentCorrelationSection({
  incidenteId,
  item,
  canManage,
  onUpdated,
}: IncidentCorrelationSectionProps) {
  const fetchFn = useCallback(() => fetchIncidenteGrupo(incidenteId), [incidenteId]);
  const { data: grupo, loading, refetch } = useApiQuery<GrupoIncidente>({ fetchFn });
  const historialFn = useCallback(() => fetchCorrelacionesPorIncidente(incidenteId), [incidenteId]);
  const { data: historialRaw, refetch: refetchHistorial } = useApiQuery<CorrelacionItem[]>({
    fetchFn: historialFn,
  });
  const [showHistorial, setShowHistorial] = useState(false);
  const [revertirTarget, setRevertirTarget] = useState<CorrelacionItem | null>(null);

  const linked = isLinkedReport(item);
  const canonicoId = item.incidente.incidenteCanonicoId ?? incidenteId;
  const folioCanonico = item.incidente.folioCanonico;

  const handleResolved = () => {
    refetch();
    refetchHistorial();
    onUpdated();
  };

  if (loading && !grupo) return null;

  const pendientes = grupo?.sugerenciasPendientes?.filter((s) => s.estado === 'PENDIENTE') ?? [];
  const vinculados = grupo?.vinculados ?? [];
  const historial = (historialRaw ?? []).filter(
    (c) => c.estado === 'CONFIRMADA' || c.estado === 'DESCARTADA',
  );

  if (!linked && pendientes.length === 0 && vinculados.length === 0 && historial.length === 0) {
    return null;
  }

  return (
    <div className="rev-card p-3 mb-3">
      <h3 className="h6 mb-3">Reportes relacionados</h3>

      {linked && folioCanonico && (
        <Alert variant="info" className="small">
          Despacho centralizado en{' '}
          <Link to={`/incidentes/${canonicoId}`} className="alert-link">
            {folioCanonico}
          </Link>
          . Asigne recursos desde el incidente canónico.
        </Alert>
      )}

      {vinculados.length > 0 && (
        <>
          <p className="small text-muted mb-2">Reportes vinculados al mismo suceso</p>
          <ListGroup variant="flush" className="mb-3">
            {vinculados.map((v) => (
              <ListGroup.Item key={v.id} className="bg-transparent px-0 text-light">
                <Link to={`/incidentes/${v.id}`}>{v.folio ?? v.id.slice(0, 8)}</Link>
                <span className="text-muted ms-2">{v.tipo}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}

      {pendientes.length > 0 && (
        <>
          <p className="small text-muted mb-2">Sugerencias pendientes de revisión</p>
          {pendientes.map((s) => (
            <SugerenciaCard
              key={s.id}
              sugerencia={s}
              canManage={canManage}
              onResolved={handleResolved}
            />
          ))}
        </>
      )}

      {historial.length > 0 && (
        <div className="mt-3">
          <Button
            variant="link"
            className="p-0 text-decoration-none small"
            onClick={() => setShowHistorial((v) => !v)}
            aria-expanded={showHistorial}
          >
            Historial de correlaciones ({historial.length})
          </Button>
          <Collapse in={showHistorial}>
            <div className="mt-2">
              <Table size="sm" className="rev-data-table rev-data-table--compact mb-0">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Par</th>
                    <th>Canónico</th>
                    <th>Decisión</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {historial.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Badge bg={c.estado === 'CONFIRMADA' ? 'success' : 'secondary'}>
                          {c.estado}
                        </Badge>
                      </td>
                      <td className="small">
                        {c.incidenteA.folio} ↔ {c.incidenteB.folio}
                      </td>
                      <td className="small">{folioCanonicoDe(c)}</td>
                      <td className="small">
                        <div>{c.decididoPor ?? '—'}</div>
                        <div className="text-muted">{formatFecha(c.decididoAt)}</div>
                      </td>
                      <td className="text-end">
                        {canManage && c.estado === 'CONFIRMADA' && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => setRevertirTarget(c)}
                          >
                            Deshacer
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Collapse>
        </div>
      )}

      <RevertirCorrelacionModal
        correlacion={revertirTarget}
        show={revertirTarget != null}
        onClose={() => setRevertirTarget(null)}
        onDone={handleResolved}
      />
    </div>
  );
}
