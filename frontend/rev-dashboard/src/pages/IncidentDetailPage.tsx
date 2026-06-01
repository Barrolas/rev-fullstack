import { useCallback, useState } from 'react';
import { Badge, Button, Col, ListGroup, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { DashboardItem, fetchDashboardItem } from '../api';
import { useToast } from '../contexts/ToastContext';
import AssignResourceModal from '../components/incidentes/AssignResourceModal';
import IncidentAdjuntoGallery from '../components/incidentes/IncidentAdjuntoGallery';
import DegradedAlert from '../components/DegradedAlert';
import AppPage from '../components/layout/AppPage';
import ModuleHub from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import StateView from '../components/primitives/StateView';
import RiskBadge from '../components/RiskBadge';
import { riskLabel } from '../utils/zonaMapStyles';
import { useAuth } from '../hooks/useAuth';
import { useApiQuery } from '../hooks/useApiQuery';

function origenLabel(origen?: string): string | null {
  if (!origen) return null;
  if (origen === 'PUBLICO') return 'Reporte ciudadano';
  if (origen === 'INTERNO') return 'Registro interno';
  return origen;
}

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
  const inc = item?.incidente;
  const showReporter =
    inc && !inc.anonimo && canManageIncidents && (inc.reportanteNombre || inc.reportanteContacto);

  const rail = item ? (
    <>
      <div className="rev-card p-3">
        <h2 className="h6 mb-3">Nivel de riesgo</h2>
        <RiskBadge nivel={item.zonaRiesgo.nivel} />
        <p className="text-muted small mt-2 mb-0">
          Zona {riskLabel(item.zonaRiesgo.nivel).toLowerCase()}
          {item.zonaRiesgo.cached && ' · datos en actualización'}
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
          { label: inc?.folio ?? (inc ? `#${inc.id.slice(0, 8)}…` : 'Detalle') },
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
            {item && inc && (
              <div className="rev-card p-4">
                <DegradedAlert show={item.degraded} />
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                  <div>
                    <h2 className="h4 mb-1">{inc.tipo}</h2>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="secondary">{inc.estado}</Badge>
                      {inc.anonimo && <Badge bg="dark">Anónimo</Badge>}
                      {origenLabel(inc.origenReporte) && (
                        <Badge bg="info" text="dark">
                          {origenLabel(inc.origenReporte)}
                        </Badge>
                      )}
                      {(inc.adjuntos?.length ?? 0) > 0 && (
                        <Badge bg="warning" text="dark">
                          <i className="bi bi-paperclip me-1" />
                          {inc.adjuntos!.length} adjunto{inc.adjuntos!.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <RiskBadge nivel={item.zonaRiesgo.nivel} />
                </div>

                {inc.folio && (
                  <p className="mb-2">
                    <small className="text-muted d-block">Folio</small>
                    <strong>{inc.folio}</strong>
                  </p>
                )}

                <p>{inc.descripcion}</p>

                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <small className="text-muted d-block">Ubicación</small>
                    {inc.lat != null && inc.lng != null ? (
                      <span>
                        {inc.lat.toFixed(5)}, {inc.lng.toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-muted">Sin coordenadas</span>
                    )}
                    <Link to="/zonas" className="d-block small mt-1">
                      Consultar mapa de zonas
                    </Link>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">Referencia / dirección</small>
                    <span>{inc.direccionReferencia || '—'}</span>
                  </Col>
                </Row>

                {showReporter && (
                  <div className="rev-card p-3 mb-3 bg-dark border-secondary">
                    <h3 className="h6 mb-2">Datos del reportante</h3>
                    <Row className="g-2 small">
                      {(inc.reportanteNombre || inc.reportanteApellido) && (
                        <Col sm={6}>
                          <span className="text-muted d-block">Nombre</span>
                          {[inc.reportanteNombre, inc.reportanteApellido].filter(Boolean).join(' ')}
                        </Col>
                      )}
                      {inc.reportanteRut && (
                        <Col sm={6}>
                          <span className="text-muted d-block">RUT</span>
                          {inc.reportanteRut}
                        </Col>
                      )}
                      {inc.reportanteContacto && (
                        <Col sm={12}>
                          <span className="text-muted d-block">Contacto</span>
                          {inc.reportanteContacto}
                        </Col>
                      )}
                    </Row>
                  </div>
                )}

                {id && inc.adjuntos && inc.adjuntos.length > 0 && (
                  <IncidentAdjuntoGallery incidenteId={id} adjuntos={inc.adjuntos} />
                )}
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
