import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUi } from '../contexts/UiContext';

/** Fallback: redirige a incidentes y abre el modal de nuevo incidente. */
export default function NewIncidentPage() {
  const { openIncidentModal } = useUi();

  useEffect(() => {
    openIncidentModal();
  }, [openIncidentModal]);

  return <Navigate to="/incidentes" replace />;
}
