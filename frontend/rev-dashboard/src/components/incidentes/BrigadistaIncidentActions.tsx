import { Button, ButtonGroup } from 'react-bootstrap';
import { brigadistaAvanzarEstadoDespacho, brigadistaTransicionIncidente } from '../../api';
import { useToast } from '../../contexts/ToastContext';

interface BrigadistaIncidentActionsProps {
  incidenteId: string;
  incidenteEstado: string;
  asignacionId?: number;
  estadoDespacho?: string;
  onUpdated: () => void;
}

export default function BrigadistaIncidentActions({
  incidenteId,
  incidenteEstado,
  asignacionId,
  estadoDespacho,
  onUpdated,
}: BrigadistaIncidentActionsProps) {
  const { showToast } = useToast();

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      showToast(ok, 'success');
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo actualizar', 'danger');
    }
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      {asignacionId && estadoDespacho === 'ASIGNADA' && (
        <Button
          size="sm"
          variant="outline-warning"
          onClick={() => run(
            () => brigadistaAvanzarEstadoDespacho(asignacionId, 'EN_CAMINO'),
            'Brigada en camino',
          )}
        >
          En camino
        </Button>
      )}
      {asignacionId && estadoDespacho === 'EN_CAMINO' && (
        <Button
          size="sm"
          variant="outline-warning"
          onClick={() => run(
            () => brigadistaAvanzarEstadoDespacho(asignacionId, 'EN_INCIDENTE'),
            'Brigada en incidente',
          )}
        >
          En incidente
        </Button>
      )}
      {incidenteEstado === 'REPORTADO' && (
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => run(
            () => brigadistaTransicionIncidente(incidenteId, 'EN_PROGRESO'),
            'Incidente en progreso',
          )}
        >
          Iniciar atención
        </Button>
      )}
      {(incidenteEstado === 'EN_PROGRESO' || incidenteEstado === 'ESCALADO') && (
        <ButtonGroup size="sm">
          <Button
            variant="outline-success"
            onClick={() => run(
              () => brigadistaTransicionIncidente(incidenteId, 'CONTROLADO'),
              'Incidente controlado',
            )}
          >
            Marcar controlado
          </Button>
        </ButtonGroup>
      )}
    </div>
  );
}
