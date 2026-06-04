import { Link } from 'react-router-dom';
import type { MapaIncidentePunto } from '../../api';
import RiskBadge from '../RiskBadge';
import { formatOrigenReporte } from '../../utils/territorialMapUtils';
import { formatEstadoLabel } from '../../utils/dashboardAggregates';

interface ZonaIncidentePopupProps {
  punto: MapaIncidentePunto;
}

export default function ZonaIncidentePopup({ punto }: ZonaIncidentePopupProps) {
  const pending = punto.sugerenciasPendientes > 0;
  const grupo = punto.reportesEnGrupo > 1;

  return (
    <div className="rev-zones-map__popup-body">
      <div className="rev-zones-map__popup-title">
        {punto.folio ? `Folio ${punto.folio}` : 'Incidente'}
      </div>
      <p className="rev-zones-map__popup-meta mb-1">
        <strong>{punto.tipo}</strong> · {formatEstadoLabel(punto.estado)}
      </p>
      <p className="rev-zones-map__popup-meta small text-muted mb-2">
        {formatOrigenReporte(punto.origenReporte)}
        {grupo && (
          <>
            {' '}
            · <span className="rev-zones-map__popup-badge">{punto.reportesEnGrupo} reportes</span>
          </>
        )}
      </p>
      {punto.direccionReferencia && (
        <p className="rev-zones-map__popup-hint small mb-2">{punto.direccionReferencia}</p>
      )}
      <div className="mb-2">
        {punto.zonaNombre && (
          <p className="rev-zones-map__popup-meta small mb-1">
            Zona: <strong>{punto.zonaNombre}</strong>
          </p>
        )}
        <RiskBadge nivel={punto.nivelRiesgoZona} />
      </div>
      {pending && (
        <p className="small text-warning mb-2">
          <i className="bi bi-link-45deg me-1" aria-hidden="true" />
          {punto.sugerenciasPendientes} sugerencia(s) de correlación
        </p>
      )}
      <div className="d-flex flex-wrap gap-2">
        <Link to={`/incidentes/${punto.id}`} className="btn btn-sm btn-primary">
          Ver detalle
        </Link>
        {pending && (
          <Link to="/incidentes?vista=correlaciones" className="btn btn-sm btn-outline-warning">
            Correlaciones
          </Link>
        )}
      </div>
    </div>
  );
}
