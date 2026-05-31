import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api';
import ProtectedLayout from './components/ProtectedLayout';
import DashboardPage from './pages/DashboardPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import IncidentesPage from './pages/IncidentesPage';
import LoginPage from './pages/LoginPage';
import NewIncidentPage from './pages/NewIncidentPage';
import RecursosPage from './pages/RecursosPage';
import ZonasPage from './pages/ZonasPage';

function LoginRedirect() {
  if (getToken()) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRedirect />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="incidentes" element={<IncidentesPage />} />
          <Route path="incidentes/nuevo" element={<NewIncidentPage />} />
          <Route path="incidentes/:id" element={<IncidentDetailPage />} />
          <Route path="zonas" element={<ZonasPage />} />
          <Route path="recursos" element={<RecursosPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
