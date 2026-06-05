import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getToken } from '../api';
import { useSessionIdle } from '../hooks/useSessionIdle';
import { REV_SESSION_EXPIRED } from '../utils/sessionEvents';
import { LayoutProvider } from '../contexts/LayoutContext';
import { ToastProvider } from '../contexts/ToastContext';
import { UiProvider } from '../contexts/UiContext';
import AppShell from './layout/AppShell';
import AppFooter from './layout/AppFooter';
import Sidebar from './layout/Sidebar';
import IncidentFormModal from './incidentes/IncidentFormModal';
import BackendReadyGate from './BackendReadyGate';

export default function ProtectedLayout() {
  const navigate = useNavigate();
  useSessionIdle();

  useEffect(() => {
    const onSessionExpired = () => navigate('/login', { replace: true });
    window.addEventListener(REV_SESSION_EXPIRED, onSessionExpired);
    return () => window.removeEventListener(REV_SESSION_EXPIRED, onSessionExpired);
  }, [navigate]);

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <LayoutProvider>
      <UiProvider>
        <ToastProvider>
          <AppShell sidebar={<Sidebar />}>
            <BackendReadyGate>
              <Outlet />
            </BackendReadyGate>
            <IncidentFormModal />
            <AppFooter />
          </AppShell>
        </ToastProvider>
      </UiProvider>
    </LayoutProvider>
  );
}
