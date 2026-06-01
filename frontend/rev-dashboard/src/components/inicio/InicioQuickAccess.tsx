import { Link } from 'react-router-dom';
import InicioSectionHead from './InicioSectionHead';

const MODULES = [
  { to: '/', icon: 'bi-speedometer2', label: 'Despacho', desc: 'Vista general del día' },
  { to: '/incidentes', icon: 'bi-fire', label: 'Incidentes', desc: 'Emergencias y seguimiento' },
  { to: '/zonas', icon: 'bi-map', label: 'Zonas', desc: 'Riesgo en el territorio' },
  { to: '/recursos', icon: 'bi-truck', label: 'Recursos', desc: 'Brigadas y vehículos' },
] as const;

export default function InicioQuickAccess() {
  return (
    <section className="rev-inicio__panel rev-card" aria-label="Accesos rápidos">
      <InicioSectionHead
        eyebrow="Ir directo a"
        title="Accesos rápidos"
        desc="Las secciones que más usa en su turno"
        compact
      />
      <ul className="rev-inicio__nav-grid">
        {MODULES.map(({ to, icon, label, desc }) => (
          <li key={to}>
            <Link to={to} className="rev-inicio__nav-tile">
              <span className="rev-inicio__nav-icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
              </span>
              <span className="rev-inicio__nav-label">{label}</span>
              <span className="rev-inicio__nav-desc">{desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
