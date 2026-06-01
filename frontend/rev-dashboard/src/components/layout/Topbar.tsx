import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useLayout } from '../../contexts/LayoutContext';
import { useLiveClock } from '../../hooks/useLiveClock';
import { useOperationalPulse } from '../../hooks/useOperationalPulse';
import WeatherChip from '../weather/WeatherChip';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface TopbarProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export default function Topbar({ title, subtitle, breadcrumbs, actions }: TopbarProps) {
  const { toggleSidebar } = useLayout();
  const { displayName, role } = useAuth();
  const { time, date } = useLiveClock();
  const pulse = useOperationalPulse();
  const avatarLetter = (displayName[0] ?? 'U').toUpperCase();

  return (
    <header className="rev-topbar">
      <div className="rev-topbar__frame">
        <div className="rev-topbar__accent" aria-hidden="true" />

        <div className="rev-topbar__inner">
          <div className="rev-topbar__zone rev-topbar__zone--nav">
            <button
              type="button"
              className="rev-topbar__menu-btn"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>

            <div className="rev-topbar__identity">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="rev-topbar__path" aria-label="Ruta de navegación">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={`${crumb.label}-${i}`} className="rev-topbar__path-item">
                      {i > 0 && <span className="rev-topbar__path-sep" aria-hidden="true">/</span>}
                      {crumb.to ? (
                        <Link to={crumb.to} className="rev-topbar__path-link">{crumb.label}</Link>
                      ) : (
                        <span className="rev-topbar__path-current">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
              <div className="rev-topbar__headline">
                <h1 className="rev-topbar__title">{title}</h1>
                {subtitle && <p className="rev-topbar__subtitle">{subtitle}</p>}
              </div>
            </div>
          </div>

          <div className="rev-topbar__zone rev-topbar__zone--stats" aria-label="Estado operacional">
            <div className={`rev-topbar__stat rev-topbar__stat--${pulse.offline ? 'warn' : 'live'}`}>
              <span className="rev-topbar__stat-dot" aria-hidden="true" />
              <span className="rev-topbar__stat-label">{pulse.offline ? 'Sin conexión' : 'En línea'}</span>
            </div>
            <div className="rev-topbar__stat">
              <i className="bi bi-fire" aria-hidden="true" />
              <span className="rev-topbar__stat-value">{pulse.loading ? '—' : pulse.activos}</span>
              <span className="rev-topbar__stat-label">activos</span>
            </div>
            <div className="rev-topbar__stat rev-topbar__stat--risk">
              <i className="bi bi-exclamation-triangle" aria-hidden="true" />
              <span className="rev-topbar__stat-value">{pulse.loading ? '—' : pulse.altoRiesgo}</span>
              <span className="rev-topbar__stat-label">alto</span>
            </div>
            {pulse.degradados > 0 && (
              <div className="rev-topbar__stat rev-topbar__stat--warn">
                <i className="bi bi-shield-exclamation" aria-hidden="true" />
                <span className="rev-topbar__stat-value">{pulse.degradados}</span>
                <span className="rev-topbar__stat-label">avisos</span>
              </div>
            )}
            <div className="rev-topbar__stat rev-topbar__stat--weather">
              <WeatherChip compact />
            </div>
            <div className="rev-topbar__stat rev-topbar__stat--time">
              <span className="rev-topbar__stat-value rev-topbar__stat-value--mono">{time}</span>
              <span className="rev-topbar__stat-label rev-topbar__stat-label--date">{date}</span>
            </div>
          </div>

          <div className="rev-topbar__zone rev-topbar__zone--session">
            <div className="rev-topbar__user" title={displayName}>
              <span className="rev-topbar__user-avatar">{avatarLetter}</span>
              <span className="rev-topbar__user-meta">
                <span className="rev-topbar__user-name">{displayName}</span>
                <span className="rev-topbar__user-role">{role}</span>
              </span>
            </div>
            {actions && <div className="rev-topbar__actions">{actions}</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
