import { Badge, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DashboardItem } from '../api';
import DegradedAlert from './DegradedAlert';
import RiskBadge from './RiskBadge';

interface IncidentCardProps {
  item: DashboardItem;
}

function estadoVariant(estado: string): string {
  switch (estado) {
    case 'REPORTADO': return 'info';
    case 'EN_PROGRESO': return 'warning';
    case 'CONTROLADO': return 'success';
    case 'ESCALADO': return 'danger';
    case 'CERRADO': return 'secondary';
    default: return 'light';
  }
}

export default function IncidentCard({ item }: IncidentCardProps) {
  const { incidente, zonaRiesgo, recursos, degraded } = item;

  return (
    <Col md={6} lg={4} className="mb-3">
      <Card className="rev-card h-100">
        <Card.Body>
          <DegradedAlert show={degraded} />
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="h6 mb-0">{incidente.tipo}</Card.Title>
            <Badge bg={estadoVariant(incidente.estado)}>{incidente.estado}</Badge>
          </div>
          <Card.Text className="text-muted small">{incidente.descripcion}</Card.Text>
          <Row className="g-2 mb-2">
            <Col xs={6}>
              <small className="text-muted d-block">Riesgo</small>
              <RiskBadge nivel={zonaRiesgo.nivel} />
              {zonaRiesgo.cached && <Badge bg="secondary" className="ms-1">Cache</Badge>}
            </Col>
            <Col xs={6}>
              <small className="text-muted d-block">Ubicacion</small>
              <small>{incidente.lat.toFixed(4)}, {incidente.lng.toFixed(4)}</small>
            </Col>
          </Row>
          <small className="text-muted d-block mb-1">Recursos asignados</small>
          {recursos.length === 0 ? (
            <p className="small text-muted mb-2">Sin recursos</p>
          ) : (
            <ListGroup variant="flush" className="mb-2">
              {recursos.map((r, i) => (
                <ListGroup.Item key={i} className="px-0 py-1 bg-transparent text-light small">
                  {r.tipo}: {r.descripcion} ({r.estado})
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          <Link to={`/incidentes/${incidente.id}`} className="btn btn-sm btn-outline-primary">
            Ver detalle
          </Link>
        </Card.Body>
      </Card>
    </Col>
  );
}
