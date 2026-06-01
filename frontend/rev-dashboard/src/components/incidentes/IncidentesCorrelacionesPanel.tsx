import { Fragment, useCallback, useState } from 'react';
import { Badge, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  CorrelacionItem,
  confirmarCorrelacion,
  descartarCorrelacion,
  fetchCorrelacionesPendientes,
} from '../../api';
import CorrelationPairMap from './CorrelationPairMap';
import StateView from '../primitives/StateView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../../hooks/useAuth';

interface IncidentesCorrelacionesPanelProps {
  onResolved?: () => void;
}

export default function IncidentesCorrelacionesPanel({ onResolved }: IncidentesCorrelacionesPanelProps) {
  const { canManageIncidents } = useAuth();
  const fetchFn = useCallback(() => fetchCorrelacionesPendientes(), []);
  const { data: list, loading, error, refetch } = useApiQuery<CorrelacionItem[]>({ fetchFn });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <StateView
      state={loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'idle'}
      errorMessage={error ?? undefined}
      onRetry={refetch}
      emptyTitle="Sin sugerencias"
      emptyMessage="No hay pares de reportes pendientes de revisión."
    >
      <div className="rev-card p-3 rev-incidentes-correlaciones">
        <p className="text-muted small mb-3">
          Revise reportes cercanos en tiempo y ubicación. Confirme si corresponden al mismo suceso
          antes de despachar recursos al incidente canónico.
        </p>
        <div className="table-responsive">
          <Table hover className="rev-data-table rev-data-table--compact align-middle mb-0">
            <thead>
              <tr>
                <th>Score</th>
                <th>Folios</th>
                <th>Distancia</th>
                <th>Tiempo</th>
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
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="me-1"
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        {expandedId === c.id ? 'Ocultar' : 'Mapa'}
                      </Button>
                      {canManageIncidents && (
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
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr>
                      <td colSpan={5}>
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
      </div>
    </StateView>
  );
}
