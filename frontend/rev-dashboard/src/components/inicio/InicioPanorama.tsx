import { DashboardItem } from '../../api';
import {
  ESTADO_ORDER,
  countIncidentsByEstado,
  formatEstadoLabel,
} from '../../utils/dashboardAggregates';
import InicioSectionHead from './InicioSectionHead';

interface InicioPanoramaProps {
  items: DashboardItem[];
}

export default function InicioPanorama({ items }: InicioPanoramaProps) {
  const estadoCounts = countIncidentsByEstado(items);
  const activos = items.filter((i) => i.incidente.estado !== 'CERRADO').length;

  return (
    <section className="rev-inicio__panel rev-card" aria-label="Emergencias por estado">
      <InicioSectionHead
        eyebrow="Hoy en la comuna"
        title="Emergencias por estado"
        desc={`${activos} caso${activos === 1 ? '' : 's'} activo${activos === 1 ? '' : 's'} requieren seguimiento`}
        linkTo="/"
        linkLabel="Ver despacho"
      />
      {items.length === 0 ? (
        <p className="rev-inicio__empty">No hay emergencias registradas por ahora</p>
      ) : (
        <ul className="rev-inicio__estado-grid">
          {ESTADO_ORDER.map((estado) => {
            const count = estadoCounts[estado] ?? 0;
            if (count === 0 && estado === 'CERRADO') return null;
            const isActive = estado === 'ESCALADO' || estado === 'EN_PROGRESO';
            return (
              <li
                key={estado}
                className={`rev-inicio__estado-tile${isActive ? ' rev-inicio__estado-tile--hot' : ''}${count === 0 ? ' rev-inicio__estado-tile--zero' : ''}`}
              >
                <span className="rev-inicio__estado-tile-value">{count}</span>
                <span className="rev-inicio__estado-tile-label">{formatEstadoLabel(estado)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
