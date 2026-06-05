import { useState } from 'react';

import { NavLink } from 'react-router-dom';

import { clearToken } from '../../api';

import { REV_BRAND } from '../../branding';

import { useLayout } from '../../contexts/LayoutContext';

import { useAuth } from '../../hooks/useAuth';

import RevLogo from '../branding/RevLogo';

import ConfirmDialog from '../primitives/ConfirmDialog';



const NAV_ITEMS = [

  { to: '/inicio', label: 'Inicio', icon: 'bi-house', end: false },

  { to: '/despacho/operacion', label: 'Despacho', icon: 'bi-speedometer2', end: true },

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

      <div className="rev-sidebar__brand-panel">
        <div className="rev-sidebar__brand">
          <div className="rev-sidebar__brand-hero">
            <div className="rev-sidebar__brand-glow" aria-hidden="true" />
            <RevLogo
              variant="emblemColorAlt"
              size={32}
              className="rev-sidebar__brand-logo"
            />
          </div>
          <div className="rev-sidebar__brand-copy">
            <span className="rev-sidebar__brand-name">{REV_BRAND.shortName}</span>
            <span className="rev-sidebar__brand-tagline">Red Emergencia Valle</span>
          </div>
        </div>
      </div>



      <nav className="rev-sidebar__nav" aria-label="Navegación principal">

        <p className="rev-sidebar__nav-heading">Módulos</p>

        {NAV_ITEMS.map((item) => (

          <NavLink

            key={item.to}

            to={item.to}

            end={item.end}

            className={({ isActive }) =>

              `rev-sidebar__nav-item${isActive ? ' active' : ''}`

            }

            onClick={handleNavClick}

            title={sidebarCollapsed ? item.label : undefined}

          >

            <span className="rev-sidebar__nav-icon" aria-hidden="true">

              <i className={`bi ${item.icon}`} />

            </span>

            <span className="rev-sidebar__nav-label">{item.label}</span>

          </NavLink>

        ))}

      </nav>



      <div className="rev-sidebar__footer">
        <div className="rev-sidebar__user-panel">
          <div className="rev-sidebar__user-card">
            <div className="rev-sidebar__user-avatar">{avatarLetter}</div>
            <div className="rev-sidebar__user-info">
              <div className="rev-sidebar__user-name">{displayName}</div>
              <div className="rev-sidebar__user-role">{role}</div>
            </div>
          </div>
        </div>

        <div className="rev-sidebar__actions-panel">
          <div className="rev-sidebar__actions">

          {isAdmin && (

            <a

              href={keycloakAdminUrl}

              target="_blank"

              rel="noopener noreferrer"

              className="rev-sidebar__action rev-sidebar__action--admin"

              title="Administración municipal"
            >

              <i className="bi bi-shield-lock" aria-hidden="true" />

              <span className="rev-sidebar__action-label">Administración</span>

            </a>

          )}

          <button

            type="button"

            className="rev-sidebar__action rev-sidebar__action--ghost d-none d-lg-flex"

            onClick={toggleSidebarCollapsed}

            title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}

          >

            <i

              className={`bi ${sidebarCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}

              aria-hidden="true"

            />

            <span className="rev-sidebar__action-label">

              {sidebarCollapsed ? 'Expandir' : 'Contraer'}

            </span>

          </button>

          <button

            type="button"

            className="rev-sidebar__action rev-sidebar__action--logout"

            onClick={() => setLogoutOpen(true)}

          >

            <i className="bi bi-box-arrow-right" aria-hidden="true" />

            <span className="rev-sidebar__action-label">Cerrar sesión</span>

          </button>

          </div>
        </div>

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

