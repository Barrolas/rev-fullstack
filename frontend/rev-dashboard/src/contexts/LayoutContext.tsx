import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface LayoutContextValue {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapsed: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((v) => !v), []);

  const value = useMemo(
    () => ({
      sidebarOpen,
      sidebarCollapsed,
      toggleSidebar,
      closeSidebar,
      toggleSidebarCollapsed,
    }),
    [sidebarOpen, sidebarCollapsed, toggleSidebar, closeSidebar, toggleSidebarCollapsed],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout debe usarse dentro de LayoutProvider');
  return ctx;
}
