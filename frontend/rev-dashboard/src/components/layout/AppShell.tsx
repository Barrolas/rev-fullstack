import { type ReactNode } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import OperationalAmbient from './OperationalAmbient';

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function AppShell({ sidebar, children }: AppShellProps) {
  const { sidebarOpen, sidebarCollapsed, closeSidebar } = useLayout();

  return (
    <div className={`rev-app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <div
        className={`rev-sidebar-backdrop${sidebarOpen ? ' show' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      {sidebar}
      <div className="rev-main">
        <OperationalAmbient />
        <div className="rev-main__content">{children}</div>
      </div>
    </div>
  );
}
