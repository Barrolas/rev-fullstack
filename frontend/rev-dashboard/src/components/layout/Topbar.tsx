import { type ReactNode } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';

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

  return (
    <header className="rev-topbar">
      <div className="rev-topbar__left">
        <button
          type="button"
          className="rev-topbar__menu-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <i className="bi bi-list" />
        </button>
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-1 small">
              {breadcrumbs.map((crumb, i) => (
                <Breadcrumb.Item
                  key={`${crumb.label}-${i}`}
                  linkAs={crumb.to ? Link : undefined}
                  linkProps={crumb.to ? { to: crumb.to } : undefined}
                  active={!crumb.to}
                >
                  {crumb.label}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          <h1 className="rev-topbar__title">{title}</h1>
          {subtitle && <small className="text-muted d-block">{subtitle}</small>}
        </div>
      </div>
      {actions && <div className="rev-topbar__actions">{actions}</div>}
    </header>
  );
}
