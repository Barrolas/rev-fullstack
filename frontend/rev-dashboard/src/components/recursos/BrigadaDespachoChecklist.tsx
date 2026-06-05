import { Badge } from 'react-bootstrap';
import type { BrigadaElegibilidad } from '../../api';
import { labelListaDespacho, semaforoClass } from '../../utils/recursosLabels';

interface BrigadaDespachoChecklistProps {
  elegibilidad: BrigadaElegibilidad | null;
  loading?: boolean;
  compact?: boolean;
  showProgress?: boolean;
}

export default function BrigadaDespachoChecklist({
  elegibilidad,
  loading = false,
  compact = false,
  showProgress = true,
}: BrigadaDespachoChecklistProps) {
  if (loading) {
    return <p className="text-muted small mb-0">Verificando elegibilidad…</p>;
  }
  if (!elegibilidad) {
    return null;
  }

  const lista = elegibilidad.listaParaDespacho;
  const integ = elegibilidad.integrantes ?? 0;
  const cap = elegibilidad.capacidadBrigada ?? 0;

  return (
    <div
      className={`rev-recursos-checklist${compact ? ' rev-recursos-checklist--compact' : ''}`}
    >
      <div className="rev-recursos-checklist__head">
        <span className={`rev-recursos-semaforo ${semaforoClass(lista)}`} aria-hidden="true" />
        <Badge bg={lista ? 'success' : 'warning'} text={lista ? undefined : 'dark'}>
          {labelListaDespacho(lista)} para despacho
        </Badge>
      </div>
      {showProgress && cap > 0 && (
        <p className="rev-recursos-checklist__meta small text-muted mb-2">
          Integrantes: {integ} / {cap}
          {elegibilidad.capacidadPasajerosVehiculoPrincipal != null &&
            ` · Vehículo principal: ${elegibilidad.capacidadPasajerosVehiculoPrincipal} plazas`}
        </p>
      )}
      {!lista && elegibilidad.motivos?.length > 0 && (
        <ul className="rev-recursos-checklist__motivos small mb-0">
          {elegibilidad.motivos.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      {lista && !compact && (
        <p className="small text-success mb-0">
          La brigada puede asignarse desde Despacho operativo.
        </p>
      )}
    </div>
  );
}
