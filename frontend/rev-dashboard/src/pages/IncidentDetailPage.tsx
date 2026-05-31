import { useCallback, useState } from 'react';
import { Badge, Button, Col, ListGroup, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { DashboardItem, fetchDashboardItem } from '../api';
import { useToast } from '../contexts/ToastContext';
import AssignResourceModal from '../components/incidentes/AssignResourceModal';
import DegradedAlert from '../components/DegradedAlert';
import AppPage from '../components/layout/AppPage';
import ModuleHub from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../hooks/useAuth';
import { useApiQuery } from '../hooks/useApiQuery';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { canManageIncidents } = useAuth();
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchFn = useCallback(async () => {
    if (!id) throw new Error('ID de incidente no válido');
    return fetchDashboardItem(id);
  }, [id]);

  const { data: item, loading, error, refetch } = useApiQuery<DashboardItem>({
    fetchFn,
    enabled: !!id,
  });

  const viewState = loading ? 'loading' : error || !item ? 'error' : 'idle';

  const rail = item ? (
    <>
      <div className="rev-card p-3">
        <h2 className="h6 mb-3">Nivel de riesgo</h2>
        <RiskBadge nivel={item.zonaRiesgo.nivel} />
        <p className="text-muted small mt-2 mb-0">
          Nivel: {item.zonaRiesgo.nivel}
          {item.zonaRiesgo.cached && ' (cache)'}
        </p>
      </div>
      <div className="rev-card p-3">
        <h2 className="h6 mb-3">Recursos asignados</h2>
        {item.recursos.length === 0 ? (
          <p className="text-muted small mb-0">Sin recursos asignados.</p>
        ) : (
          <ListGroup variant="flush">
            {item.recursos.map((r, i) => (
              <ListGroup.Item key={i} className="bg-transparent text-light px-0">
                <strong>{r.tipo}</strong> — {r.descripcion}
                <Badge bg="secondary" className="ms-1">{r.estado}</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        {canManageIncidents && (
          <Button
            variant="primary"
            size="sm"
            className="w-100 mt-3"
            onClick={() => setAssignModalOpen(true)}
          >
            <i className="bi bi-truck me-1" />
            Asignar recurso
          </Button>
        )}
      </div>
      {item.degraded && (
        <div className="rev-card p-3">
          <DegradedAlert show />
        </div>
      )}
    </>
  ) : undefined;

  return (
    <>
      <Topbar
        title={item ? item.incidente.tipo : 'Detalle de incidente'}
        breadcrumbs={[
          { label: 'Despacho', to: '/' },
          { label: 'Incidentes', to: '/incidentes' },
          { label: item ? `#${item.incidente.id.slice(0, 8)}…` : 'Detalle' },
        ]}
        actions={
          item && canManageIncidents && (
            <Button variant="outline-primary" size="sm" onClick={() => setAssignModalOpen(true)}>
              Asignar recurso
            </Button>
          )
        }
      />
      <AppPage>
        <ModuleHub rail={rail}>
          <StateView
            state={viewState}
            errorMessage={error || 'Incidente no encontrado'}
            onRetry={refetch}
          >
            {item && (
              <div className="rev-card p-4">
                <DegradedAlert show={item.degraded} />
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="h4 mb-1">{item.incidente.tipo}</h2>
                    <Badge bg="secondary">{item.incidente.estado}</Badge>
                  </div>
                  <RiskBadge nivel={item.zonaRiesgo.nivel} />
                </div>
                <p>{item.incidente.descripcion}</p>
                <Row className="g-3">
                  <Col sm={6}>
                    <small className="text-muted d-block">Coordenadas</small>
                    {item.incidente.lat}, {item.incidente.lng}
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">ID</small>
                    <code className="small">{item.incidente.id}</code>
                  </Col>
                </Row>
              </div>
            )}
          </StateView>
        </ModuleHub>
      </AppPage>

      {id && (
        <AssignResourceModal
          show={assignModalOpen}
          incidenteId={id}
          onHide={() => setAssignModalOpen(false)}
          onAssigned={() => {
            showToast('Recurso asignado correctamente', 'success');
            refetch();
          }}
        />
      )}
    </>
  );
}
