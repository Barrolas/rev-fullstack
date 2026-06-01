import { Alert } from 'react-bootstrap';

interface DegradedAlertProps {
  show: boolean;
}

export default function DegradedAlert({ show }: DegradedAlertProps) {
  if (!show) return null;
  return (
    <Alert variant="warning" className="degraded-banner rev-alert rev-alert--warning mb-3">
      Algunos datos no están disponibles en este momento. Puede continuar trabajando con la información parcial.
    </Alert>
  );
}
