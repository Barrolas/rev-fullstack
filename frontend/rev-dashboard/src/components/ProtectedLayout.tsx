import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../api';
import { LayoutProvider } from '../contexts/LayoutContext';
import { ToastProvider } from '../contexts/ToastContext';
import { UiProvider } from '../contexts/UiContext';
import AppShell from './layout/AppShell';
import AppFooter from './layout/AppFooter';
import Sidebar from './layout/Sidebar';
import IncidentFormModal from './incidentes/IncidentFormModal';

export default function ProtectedLayout() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <LayoutProvider>
      <UiProvider>
        <ToastProvider>
          <AppShell sidebar={<Sidebar />}>
            <Outlet />
            <IncidentFormModal />
            <AppFooter />
          </AppShell>
        </ToastProvider>
      </UiProvider>
    </LayoutProvider>
  );
}
