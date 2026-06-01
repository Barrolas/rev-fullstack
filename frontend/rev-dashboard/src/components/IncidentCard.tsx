import { Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DashboardItem } from '../api';
import RiskBadge from './RiskBadge';
import { formatEstadoLabel } from '../utils/dashboardAggregates';
import { getEstadoVisual, isHighPriorityIncident } from '../utils/incidentesFilters';

interface IncidentCardProps {
  item: DashboardItem;
}

export default function IncidentCard({ item }: IncidentCardProps) {
  const { incidente, zonaRiesgo, recursos, degraded } = item;
  const highPriority = isHighPriorityIncident(item);
  const estado = getEstadoVisual(incidente.estado);
  const visibleResources = recursos.slice(0, 2);
  const extraResources = recursos.length - visibleResources.length;

  return (
    <Card
      className={[
        'rev-card',
        'rev-incident-card',
        `rev-incident-card--${estado.slug}`,
        highPriority ? 'rev-incident-card--priority' : '',
      ].filter(Boolean).join(' ')}
    >
      <Card.Body className="rev-incident-card__body">
        {degraded && (
          <span className="rev-incident-card__degraded">
            <i className="bi bi-shield-exclamation" aria-hidden="true" />
            Información parcial
          </span>
        )}

        <div className="rev-incident-card__top">
          <div className="rev-incident-card__identity">
            <span className={`rev-incident-card__estado-dot rev-incident-card__estado-dot--${estado.slug}`} aria-hidden="true" />
            <span className="rev-incident-card__type">{incidente.tipo}</span>
            {incidente.folio && (
              <span className="rev-incident-card__folio small text-muted ms-1">{incidente.folio}</span>
            )}
          </div>
          <div className="d-flex flex-wrap gap-1 align-items-center">
            {(incidente.adjuntos?.length ?? 0) > 0 && (
              <Badge bg="warning" text="dark" className="rev-incident-card__badge">
                <i className="bi bi-paperclip" aria-hidden="true" />
              </Badge>
            )}
            {incidente.anonimo && incidente.origenReporte === 'PUBLICO' && (
              <Badge bg="dark" className="rev-incident-card__badge">Anónimo</Badge>
            )}
            <Badge bg={estado.variant} className="rev-incident-card__badge">
              {formatEstadoLabel(incidente.estado)}
            </Badge>
          </div>
        </div>

        <p className="rev-incident-card__desc">{incidente.descripcion}</p>

        <div className="rev-incident-card__meta">
          <div className="rev-incident-card__meta-item">
            <i className="bi bi-shield" aria-hidden="true" />
            <RiskBadge nivel={zonaRiesgo.nivel} />
            {zonaRiesgo.cached && (
              <Badge bg="secondary" className="rev-incident-card__cache">En actualización</Badge>
            )}
          </div>
          <div className="rev-incident-card__meta-item rev-incident-card__meta-item--coords">
            <i className="bi bi-geo-alt" aria-hidden="true" />
            <Link to="/zonas" className="rev-incident-card__map-link">Ver en mapa</Link>
          </div>
          <div className="rev-incident-card__meta-item">
            <i className="bi bi-truck" aria-hidden="true" />
            <span className={recursos.length === 0 ? 'rev-incident-card__meta-empty' : ''}>
              {recursos.length === 0 ? 'Sin recursos' : `${recursos.length} asignado${recursos.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {recursos.length > 0 && (
          <div className="rev-incident-card__pills">
            {visibleResources.map((r, i) => (
              <span key={i} className="rev-incident-card__pill">
                {r.tipo}
              </span>
            ))}
            {extraResources > 0 && (
              <span className="rev-incident-card__pill rev-incident-card__pill--more">
                +{extraResources}
              </span>
            )}
          </div>
        )}

        <div className="rev-incident-card__footer">
          <Link to={`/incidentes/${incidente.id}`} className="rev-incident-card__link">
            Ver detalle
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
