import { Alert } from 'react-bootstrap';

interface DegradedAlertProps {
  show: boolean;
}

export default function DegradedAlert({ show }: DegradedAlertProps) {
  if (!show) return null;
  return (
    <Alert variant="warning" className="degraded-banner mb-3">
      Modo degradado: recursos no disponibles (Circuit Breaker activo)
    </Alert>
  );
}
