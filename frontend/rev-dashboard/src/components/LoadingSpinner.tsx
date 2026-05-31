import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner() {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </div>
  );
}
