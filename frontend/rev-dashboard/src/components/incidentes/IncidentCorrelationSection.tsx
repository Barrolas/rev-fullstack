import { useCallback, useState } from 'react';
import { Alert, Badge, Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  CorrelacionItem,
  GrupoIncidente,
  confirmarCorrelacion,
  descartarCorrelacion,
  fetchIncidenteGrupo,
} from '../../api';
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

export default function IncidentCorrelationSection({
  incidenteId,
  item,
  canManage,
  onUpdated,
}: IncidentCorrelationSectionProps) {
  const fetchFn = useCallback(() => fetchIncidenteGrupo(incidenteId), [incidenteId]);
  const { data: grupo, loading, refetch } = useApiQuery<GrupoIncidente>({ fetchFn });

  const linked = isLinkedReport(item);
  const canonicoId = item.incidente.incidenteCanonicoId ?? incidenteId;
  const folioCanonico = item.incidente.folioCanonico;

  const handleResolved = () => {
    refetch();
    onUpdated();
  };

  if (loading && !grupo) return null;

  const pendientes = grupo?.sugerenciasPendientes?.filter((s) => s.estado === 'PENDIENTE') ?? [];
  const vinculados = grupo?.vinculados ?? [];

  if (!linked && pendientes.length === 0 && vinculados.length === 0) {
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
    </div>
  );
}
