import { Link } from 'react-router-dom';
import { REV_BRAND } from '../../branding';
import RevLogo from '../branding/RevLogo';
import WeatherChip from '../weather/WeatherChip';
import { useLiveClock } from '../../hooks/useLiveClock';

interface InicioWelcomeProps {
  displayName: string;
  role: string;
  kpis: {
    activos: number;
    altoRiesgo: number;
    degradados: number;
    total: number;
  };
}

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const KPI_ITEMS = [
  { key: 'activos', label: 'En curso', accent: false },
  { key: 'altoRiesgo', label: 'Alto riesgo', accent: true },
  { key: 'degradados', label: 'Con avisos', accent: false },
  { key: 'total', label: 'Registrados', accent: false },
] as const;

export default function InicioWelcome({ displayName, role, kpis }: InicioWelcomeProps) {
  const { time, date } = useLiveClock();
  const firstName = displayName.split(' ')[0] ?? displayName;
  const saludo = greetingForHour(new Date().getHours());

  return (
    <section className="rev-welcome rev-card" aria-label="Bienvenida al despacho REV">
      <div className="rev-welcome__top">
        <div className="rev-welcome__identity">
          <div className="rev-welcome__emblem-wrap">
            <span className="rev-welcome__pulse" aria-hidden="true" />
            <RevLogo variant="emblemColor" size={40} className="rev-welcome__emblem" />
          </div>
          <div className="rev-welcome__copy">
            <p className="rev-welcome__eyebrow">{REV_BRAND.municipality}</p>
            <h1 className="rev-welcome__title">
              {saludo}, <span>{firstName}</span>
            </h1>
            <div className="rev-welcome__meta">
              <span className="rev-welcome__role-badge">{role}</span>
              <WeatherChip className="rev-welcome__weather" />
            </div>
          </div>
        </div>

        <div className="rev-welcome__toolbar">
          <div className="rev-welcome__clock">
            <span className="rev-welcome__clock-time">{time}</span>
            <span className="rev-welcome__clock-date">{date}</span>
          </div>
          <Link to="/" className="rev-welcome__cta">
            Ir al despacho
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ul className="rev-welcome__kpis" aria-label="Resumen del día">
        {KPI_ITEMS.map(({ key, label, accent }) => (
          <li
            key={key}
            className={`rev-welcome__kpi${accent ? ' rev-welcome__kpi--accent' : ''}`}
          >
            <span className="rev-welcome__kpi-value">{kpis[key]}</span>
            <span className="rev-welcome__kpi-label">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
