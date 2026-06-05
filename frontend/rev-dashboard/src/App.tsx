import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api';
import BootSplash from './components/branding/BootSplash';
import ProtectedLayout from './components/ProtectedLayout';
import DashboardPage from './pages/DashboardPage';
import DespachoOperacionPage from './pages/DespachoOperacionPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import IncidentesPage from './pages/IncidentesPage';
import InicioPage from './pages/InicioPage';
import LoginPage from './pages/LoginPage';
import NewIncidentPage from './pages/NewIncidentPage';
import PortalPage from './pages/PortalPage';
import RecursosPage from './pages/RecursosPage';
import ZonasPage from './pages/ZonasPage';

function LoginRedirect() {
  if (getToken()) return <Navigate to="/inicio" replace />;
  return <LoginPage />;
}

function DefaultRedirect() {
  return <Navigate to={getToken() ? '/inicio' : '/portal'} replace />;
}

export default function App() {
  const [booting, setBooting] = useState(true);

  const finishBoot = useCallback(() => {
    setBooting(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('rev-boot-active', booting);
    document.documentElement.classList.toggle('rev-boot-done', !booting);
    return () => {
      document.documentElement.classList.remove('rev-boot-active', 'rev-boot-done');
    };
  }, [booting]);

  return (
    <>
      {booting && <BootSplash onComplete={finishBoot} />}
      <BrowserRouter>
        <Routes>
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route element={<ProtectedLayout />}>
            <Route path="inicio" element={<InicioPage />} />
            <Route index element={<Navigate to="/despacho/operacion" replace />} />
            <Route path="despacho/operacion" element={<DespachoOperacionPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="incidentes" element={<IncidentesPage />} />
            <Route path="incidentes/nuevo" element={<NewIncidentPage />} />
            <Route path="incidentes/:id" element={<IncidentDetailPage />} />
            <Route path="zonas" element={<ZonasPage />} />
            <Route path="recursos" element={<RecursosPage />} />
          </Route>
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
