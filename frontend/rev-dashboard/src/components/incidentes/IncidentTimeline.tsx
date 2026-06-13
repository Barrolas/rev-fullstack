import { ListGroup } from 'react-bootstrap';
import { IncidenteTimelineItem } from '../../api';
import { formatFechaRev } from '../../utils/formatFecha';
import { formatEstadoLabel } from '../../utils/dashboardAggregates';

interface IncidentTimelineProps {
  items: IncidenteTimelineItem[];
}

function labelForItem(item: IncidenteTimelineItem): string {
  if (item.tipo === 'REGISTRO') return 'Registrado en el sistema';
  if (item.estadoAnterior) {
    return `${formatEstadoLabel(item.estadoAnterior)} → ${formatEstadoLabel(item.estado ?? '')}`;
  }
  return formatEstadoLabel(item.estado ?? '');
}

export default function IncidentTimeline({ items }: IncidentTimelineProps) {
  if (!items.length) {
    return <p className="text-muted small mb-0">Sin historial de estados.</p>;
  }

  return (
    <ListGroup variant="flush" className="rev-timeline">
      {items.map((item, idx) => (
        <ListGroup.Item key={`${item.tipo}-${item.fechaHora}-${idx}`} className="bg-transparent text-light px-0 py-2">
          <div className="d-flex justify-content-between gap-2 flex-wrap">
            <strong className="small">{labelForItem(item)}</strong>
            <span className="text-muted small">{formatFechaRev(item.fechaHora)}</span>
          </div>
          {item.realizadoPor && (
            <div className="text-muted small">
              {item.realizadoPor}
              {item.origen ? ` · ${item.origen}` : ''}
            </div>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
