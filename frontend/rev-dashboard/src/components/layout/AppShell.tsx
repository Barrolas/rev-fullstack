import { type ReactNode } from 'react';
import { useLayout } from '../../contexts/LayoutContext';

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
      <div className="rev-main">{children}</div>
    </div>
  );
}
