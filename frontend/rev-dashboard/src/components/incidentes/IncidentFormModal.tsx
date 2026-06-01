import RevModal from '../primitives/RevModal';
import { useUi } from '../../contexts/UiContext';
import { useToast } from '../../contexts/ToastContext';
import IncidentFormFields from './IncidentFormFields';

export default function IncidentFormModal() {
  const { incidentModalOpen, closeIncidentModal, notifyIncidentCreated } = useUi();
  const { showToast } = useToast();

  const handleSuccess = () => {
    closeIncidentModal();
    showToast('Incidente registrado correctamente', 'success');
    notifyIncidentCreated();
  };

  return (
    <RevModal
      show={incidentModalOpen}
      onHide={closeIncidentModal}
      title="Registrar incidente"
      size="xl"
    >
      <div className="rev-incident-form-modal">
        <IncidentFormFields
          onSuccess={handleSuccess}
          onCancel={closeIncidentModal}
        />
      </div>
    </RevModal>
  );
}
