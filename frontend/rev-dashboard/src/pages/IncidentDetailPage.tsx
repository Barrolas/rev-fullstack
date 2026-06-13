import { useCallback, useState } from 'react';
import { Badge, Button, Col, ListGroup, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import {
  AsignacionActiva,
  DashboardItem,
  fetchBrigadistaAsignaciones,
  fetchDashboardItem,
  fetchIncidenteTimeline,
  IncidenteTimelineItem,
} from '../api';
import BrigadistaIncidentActions from '../components/incidentes/BrigadistaIncidentActions';
import IncidentTimeline from '../components/incidentes/IncidentTimeline';
import { formatFechaRev, tiempoRelativo } from '../utils/formatFecha';
import { usePerfilOperativo } from '../hooks/usePerfilOperativo';
import { useToast } from '../contexts/ToastContext';
import IncidenteDespachoModal from '../components/incidentes/IncidenteDespachoModal';
import IncidenteOperacionPanel from '../components/incidentes/IncidenteOperacionPanel';
import IncidentAdjuntoGallery from '../components/incidentes/IncidentAdjuntoGallery';
import IncidentCorrelationSection from '../components/incidentes/IncidentCorrelationSection';
import { isLinkedReport } from '../utils/incidentesFilters';
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
  const { canManageIncidents, isBrigadistaOnly } = useAuth();
  const { perfil } = usePerfilOperativo();
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchFn = useCallback(async () => {
    if (!id) throw new Error('ID de incidente no válido');
    return fetchDashboardItem(id);
  }, [id]);

  const { data: item, loading, error, refetch } = useApiQuery<DashboardItem>({
    fetchFn,
    enabled: !!id,
  });

  const timelineFetch = useCallback(async () => {
    if (!id) return [];
    return fetchIncidenteTimeline(id);
  }, [id]);

  const { data: timeline } = useApiQuery<IncidenteTimelineItem[]>({
    fetchFn: timelineFetch,
    enabled: !!id && !!item,
  });

  const asignacionFetch = useCallback(async () => {
    if (!isBrigadistaOnly || !perfil?.esJefe) return [];
    return fetchBrigadistaAsignaciones();
  }, [isBrigadistaOnly, perfil?.esJefe]);

  const { data: asignaciones } = useApiQuery<AsignacionActiva[]>({
    fetchFn: asignacionFetch,
    enabled: !!id && isBrigadistaOnly && !!perfil?.esJefe,
  });

  const asignacionActiva = asignaciones?.find((a) => a.incidenteId === id);

  const viewState = loading ? 'loading' : error || !item ? 'error' : 'idle';
  const inc = item?.incidente;
  const showReporter =
    inc && !inc.anonimo && canManageIncidents && (inc.reportanteNombre || inc.reportanteContacto);
  const linkedReport = item ? isLinkedReport(item) : false;
  const dispatchIncidenteId =
    inc?.incidenteCanonicoId && inc.incidenteCanonicoId !== inc.id
      ? inc.incidenteCanonicoId
      : id;

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
          { label: 'Despacho', to: '/despacho/operacion' },
          { label: 'Incidentes', to: '/incidentes' },
          { label: inc?.folio ?? (inc ? `#${inc.id.slice(0, 8)}…` : 'Detalle') },
        ]}
        actions={
          item && canManageIncidents && !linkedReport && (
            <Button variant="primary" size="sm" onClick={() => setAssignModalOpen(true)}>
              <i className="bi bi-list-check me-1" aria-hidden />
              Despachar brigada…
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

                {inc.createdAt && (
                  <p className="mb-3 text-muted small">
                    <i className="bi bi-clock me-1" aria-hidden="true" />
                    Registrado {tiempoRelativo(inc.createdAt)} · {formatFechaRev(inc.createdAt)}
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

                {isBrigadistaOnly && perfil?.esJefe && inc && (
                  <div className="rev-card p-3 mb-3">
                    <h3 className="h6 mb-2">Acciones de terreno</h3>
                    <BrigadistaIncidentActions
                      incidenteId={inc.id}
                      incidenteEstado={inc.estado}
                      asignacionId={asignacionActiva?.id}
                      estadoDespacho={asignacionActiva?.estadoDespacho}
                      onUpdated={refetch}
                    />
                  </div>
                )}

                {timeline && timeline.length > 0 && (
                  <div className="rev-card p-3 mb-3">
                    <h3 className="h6 mb-3">Línea de tiempo</h3>
                    <IncidentTimeline items={timeline} />
                  </div>
                )}

                {canManageIncidents && !linkedReport && inc && (
                  <div className="rev-card p-3 mb-3 rev-incidente-ops-wrap">
                    <IncidenteOperacionPanel
                      incidenteId={inc.id}
                      incidenteEstado={inc.estado}
                      incidenteFolio={inc.folio}
                      canManage={canManageIncidents}
                      onUpdated={refetch}
                      onAssignClick={() => setAssignModalOpen(true)}
                    />
                  </div>
                )}

                {item && id && (
                  <IncidentCorrelationSection
                    incidenteId={id}
                    item={item}
                    canManage={canManageIncidents}
                    onUpdated={refetch}
                  />
                )}
              </div>
            )}
          </StateView>
        </ModuleHub>
      </AppPage>

      {dispatchIncidenteId && (
        <IncidenteDespachoModal
          show={assignModalOpen}
          incidenteId={dispatchIncidenteId}
          incidenteFolio={inc?.folio}
          incidenteTipo={inc?.tipo}
          incidenteDescripcion={inc?.descripcion}
          onHide={() => setAssignModalOpen(false)}
          onSuccess={() => {
            showToast('Brigada despachada correctamente', 'success');
            refetch();
          }}
        />
      )}
    </>
  );
}
