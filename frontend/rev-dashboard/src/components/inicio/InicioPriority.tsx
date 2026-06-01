import { DashboardItem } from '../../api';
import {
  formatEstadoLabel,
  getHighRiskDashboardItems,
} from '../../utils/dashboardAggregates';
import { riskLabel } from '../../utils/zonaMapStyles';
import InicioSectionHead from './InicioSectionHead';

interface InicioPriorityProps {
  items: DashboardItem[];
}

export default function InicioPriority({ items }: InicioPriorityProps) {
  const prioridad = getHighRiskDashboardItems(items).slice(0, 3);

  return (
    <section className="rev-inicio__panel rev-card" aria-label="Atención prioritaria">
      <InicioSectionHead
        eyebrow="Requiere acción"
        title="Prioridad del turno"
        desc="Emergencias activas en zonas de alto riesgo"
        linkTo="/incidentes"
        linkLabel="Ver listado"
        compact
      />
      {prioridad.length === 0 ? (
        <p className="rev-inicio__empty rev-inicio__empty--ok">
          <i className="bi bi-check-circle" aria-hidden="true" />
          No hay emergencias críticas pendientes en este momento.
        </p>
      ) : (
        <ul className="rev-inicio__priority-list">
          {prioridad.map((item, index) => (
            <li key={item.incidente.id} className="rev-inicio__priority-row">
              <span className="rev-inicio__priority-rank" aria-hidden="true">
                {index + 1}
              </span>
              <div className="rev-inicio__priority-body">
                <span className="rev-inicio__priority-type">{item.incidente.tipo}</span>
                <span className="rev-inicio__priority-meta">
                  {formatEstadoLabel(item.incidente.estado)}
                  <span aria-hidden="true"> · </span>
                  Zona {riskLabel(item.zonaRiesgo.nivel).toLowerCase()}
                </span>
                {item.incidente.descripcion && (
                  <span className="rev-inicio__priority-note">{item.incidente.descripcion}</span>
                )}
              </div>
              {item.degraded && (
                <span className="rev-inicio__priority-flag">Info parcial</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
