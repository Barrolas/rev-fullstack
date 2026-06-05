import { Link } from 'react-router-dom';
import { RECURSOS_FLUJO_CADENA } from '../../utils/recursosLabels';

interface RecursosGlosarioProps {
  brigadasListas: number;
  brigadasTotal: number;
}

export default function RecursosGlosario({
  brigadasListas,
  brigadasTotal,
}: RecursosGlosarioProps) {
  const puedeDespacho = brigadasListas > 0;

  return (
    <div className="rev-recursos-glosario rev-card p-3 mb-3">
      <p className="rev-recursos-glosario__cadena small text-muted mb-2">
        <i className="bi bi-diagram-3 me-1" aria-hidden="true" />
        {RECURSOS_FLUJO_CADENA}
      </p>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span className="small">
          {brigadasListas} de {brigadasTotal} brigada{brigadasTotal !== 1 ? 's' : ''} lista
          {brigadasListas !== 1 ? 's' : ''} para despacho
        </span>
        <Link
          to="/despacho"
          className={`btn btn-sm ${puedeDespacho ? 'btn-primary' : 'btn-outline-secondary disabled'}`}
          aria-disabled={!puedeDespacho}
          onClick={(e) => {
            if (!puedeDespacho) e.preventDefault();
          }}
          title={
            puedeDespacho
              ? 'Ir a asignar brigadas a incidentes'
              : 'Complete la dotación de al menos una brigada'
          }
        >
          <i className="bi bi-broadcast me-1" aria-hidden="true" />
          Despacho operativo
        </Link>
      </div>
    </div>
  );
}
