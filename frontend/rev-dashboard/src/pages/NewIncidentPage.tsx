import { useNavigate } from 'react-router-dom';
import IncidentFormFields from '../components/incidentes/IncidentFormFields';
import AppPage from '../components/layout/AppPage';
import ModuleHub from '../components/layout/ModuleHub';
import Topbar from '../components/layout/Topbar';
import { useUi } from '../contexts/UiContext';
import { useToast } from '../contexts/ToastContext';

export default function NewIncidentPage() {
  const navigate = useNavigate();
  const { notifyIncidentCreated } = useUi();
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Incidente registrado correctamente', 'success');
    notifyIncidentCreated();
    navigate('/incidentes');
  };

  return (
    <>
      <Topbar
        title="Nuevo incidente"
        breadcrumbs={[
          { label: 'Despacho', to: '/' },
          { label: 'Incidentes', to: '/incidentes' },
          { label: 'Nuevo' },
        ]}
      />
      <AppPage>
        <ModuleHub>
          <div className="rev-card p-4 rev-incident-form-modal">
            <p className="text-muted small mb-4">
              Registre un incidente operativo con ubicacion georreferenciada para despacho y
              evaluacion de riesgo en el territorio municipal.
            </p>
            <IncidentFormFields
              onSuccess={handleSuccess}
              onCancel={() => navigate('/incidentes')}
              submitLabel="Registrar incidente"
            />
          </div>
        </ModuleHub>
      </AppPage>
    </>
  );
}
