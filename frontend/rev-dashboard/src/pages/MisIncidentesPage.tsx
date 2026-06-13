import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import {
  AsignacionActiva,
  DashboardItem,
  fetchBrigadistaAsignaciones,
  fetchDashboard,
} from '../api';
import AppPage from '../components/layout/AppPage';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePerfilOperativo } from '../hooks/usePerfilOperativo';
import { formatEstadoLabel } from '../utils/dashboardAggregates';
import { formatFechaRev, tiempoRelativo } from '../utils/formatFecha';

interface MisIncidentesData {
  asignaciones: AsignacionActiva[];
  dashboards: DashboardItem[];
}

export default function MisIncidentesPage() {
  const { perfil, error: perfilError } = usePerfilOperativo();

  const fetchFn = useCallback(async (): Promise<MisIncidentesData> => {
    const [asignaciones, dashboards] = await Promise.all([
      fetchBrigadistaAsignaciones(),
      fetchDashboard(),
    ]);
    return { asignaciones, dashboards };
  }, []);

  const { data, loading, error, refetch } = useApiQuery<MisIncidentesData>({ fetchFn });

  const viewState = loading ? 'loading' : error || perfilError ? 'error' : 'idle';
  const dashboardsById = new Map(
    (data?.dashboards ?? []).map((d) => [d.incidente.id, d]),
  );

  return (
    <AppPage>
      <Topbar
        title="Mis incidentes"
        breadcrumbs={[
          { label: 'Inicio', to: '/inicio' },
          { label: 'Mis incidentes' },
        ]}
        actions={
          perfil?.brigadaNombre && (
            <Badge bg="secondary">{perfil.brigadaNombre}</Badge>
          )
        }
      />

      <StateView
        state={viewState}
        errorMessage={error ?? (perfilError ? 'Cuenta sin vínculo operativo en el sistema.' : undefined)}
        onRetry={refetch}
      >
        {data && (
          <>
            {perfil && (
              <p className="text-muted mb-3">
                {perfil.esJefe
                  ? 'Como jefe de brigada puedes avanzar el estado de los incidentes asignados.'
                  : 'Vista de solo lectura de los incidentes asignados a tu brigada.'}
              </p>
            )}
            {data.asignaciones.length === 0 ? (
              <Card className="rev-card">
                <Card.Body>
                  <p className="mb-0 text-muted">No hay asignaciones activas para tu brigada.</p>
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-3">
                {data.asignaciones.map((a) => {
                  const dash = dashboardsById.get(a.incidenteId);
                  const inc = dash?.incidente;
                  return (
                    <Col key={a.id} md={6} xl={4}>
                      <Card className="rev-card h-100">
                        <Card.Body className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <div>
                              <strong>{inc?.tipo ?? 'Incidente'}</strong>
                              {inc?.folio && (
                                <span className="text-muted small ms-2">{inc.folio}</span>
                              )}
                            </div>
                            {inc?.estado && (
                              <Badge bg="secondary">{formatEstadoLabel(inc.estado)}</Badge>
                            )}
                          </div>
                          {inc?.createdAt && (
                            <div className="text-muted small">
                              Registrado {tiempoRelativo(inc.createdAt)} · {formatFechaRev(inc.createdAt)}
                            </div>
                          )}
                          {a.estadoDespacho && (
                            <div className="small">
                              Despacho: <strong>{a.estadoDespacho}</strong>
                            </div>
                          )}
                          <div className="mt-auto">
                            <Link
                              to={`/incidentes/${a.incidenteId}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              Ver detalle
                            </Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </>
        )}
      </StateView>
    </AppPage>
  );
}
