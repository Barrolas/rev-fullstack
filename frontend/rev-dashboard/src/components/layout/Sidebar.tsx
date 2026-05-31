import { NavLink } from 'react-router-dom';
import { clearToken } from '../../api';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../primitives/ConfirmDialog';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Despacho', icon: 'bi-speedometer2', end: true },
  { to: '/incidentes', label: 'Incidentes', icon: 'bi-fire', end: false },
  { to: '/zonas', label: 'Zonas de riesgo', icon: 'bi-map', end: false },
  { to: '/recursos', label: 'Recursos', icon: 'bi-truck', end: false },
];

export default function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, closeSidebar, toggleSidebarCollapsed } = useLayout();
  const { displayName, role, isAdmin, keycloakAdminUrl, username } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleNavClick = () => {
    if (window.innerWidth < 992) closeSidebar();
  };

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  const avatarLetter = (displayName[0] ?? username[0] ?? 'U').toUpperCase();

  return (
    <aside className={`rev-sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
      <div className="rev-sidebar__brand">
        <div className="rev-sidebar__brand-mark">
          <span>
            <em>R</em>EV
          </span>
        </div>
        <span className="rev-sidebar__brand-text">Panel Despachador</span>
      </div>

      <nav className="rev-sidebar__nav" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rev-sidebar__nav-item${isActive ? ' active' : ''}`
            }
            onClick={handleNavClick}
          >
            <i className={`bi ${item.icon}`} aria-hidden="true" />
            <span className="rev-sidebar__nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="rev-sidebar__footer">
        <div className="rev-sidebar__user">
          <div className="rev-sidebar__user-avatar">{avatarLetter}</div>
          <div className="rev-sidebar__user-info">
            <div className="rev-sidebar__user-name">{displayName}</div>
            <div className="rev-sidebar__user-role">{role}</div>
          </div>
        </div>
        {isAdmin && (
          <a
            href={keycloakAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-info btn-sm w-100 mb-2"
            title="Consola de administración Keycloak (realm rev)"
          >
            <i className="bi bi-shield-lock me-1" />
            <span className="rev-sidebar__nav-label">Admin Keycloak</span>
          </a>
        )}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm w-100 mb-2 d-none d-lg-block"
          onClick={toggleSidebarCollapsed}
          title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          <i className={`bi ${sidebarCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`} />
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm w-100"
          onClick={() => setLogoutOpen(true)}
        >
          <i className="bi bi-box-arrow-right me-1" />
          <span className="rev-sidebar__nav-label">Cerrar sesión</span>
        </button>
      </div>

      <ConfirmDialog
        show={logoutOpen}
        title="Cerrar sesión"
        message="¿Desea salir del panel de despacho?"
        confirmLabel="Salir"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </aside>
  );
}
