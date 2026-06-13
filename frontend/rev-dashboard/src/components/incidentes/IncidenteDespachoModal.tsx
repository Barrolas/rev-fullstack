import { useEffect, useMemo, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import BrigadaSeleccionList from '../despacho/BrigadaSeleccionList';
import DespachoWizard from '../despacho/DespachoWizard';
import ConfirmDialog from '../primitives/ConfirmDialog';
import RevModal from '../primitives/RevModal';
import BrigadaBulkActionBar from '../shared/BrigadaBulkActionBar';
import { fetchDespachoCola } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { useBrigadaSelection } from '../../hooks/useBrigadaSelection';
import { ejecutarDespachoRapido } from '../../utils/despachoRapido';

interface IncidenteDespachoModalProps {
  show: boolean;
  incidenteId: string;
  incidenteFolio?: string;
  incidenteTipo?: string;
  incidenteDescripcion?: string;
  onHide: () => void;
  onSuccess: () => void;
}

export default function IncidenteDespachoModal({
  show,
  incidenteId,
  incidenteFolio,
  incidenteTipo,
  incidenteDescripcion,
  onHide,
  onSuccess,
}: IncidenteDespachoModalProps) {
  const { username, displayName } = useAuth();
  const despachadoPor = displayName || username || 'despachador';

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [brigadas, setBrigadas] = useState<Awaited<ReturnType<typeof fetchDespachoCola>>['brigadasDisponibles']>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [quickDispatchOpen, setQuickDispatchOpen] = useState(false);
  const [quickDispatching, setQuickDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  const brigadaSelectionRows = useMemo(
    () =>
      brigadas.map((b) => ({
        id: b.id,
        estado: b.estado,
        listaParaDespacho: b.listaParaDespacho,
      })),
    [brigadas],
  );

  const brigadaSelection = useBrigadaSelection({
    rows: brigadaSelectionRows,
    isRowSelectable: (r) => r.estado === 'DISPONIBLE' && !!r.listaParaDespacho,
  });

  const brigadasSeleccionadasNombres = useMemo(() => {
    const ids = new Set(brigadaSelection.selectedArray);
    return brigadas
      .filter((b) => ids.has(b.id))
      .map((b) => b.nombre)
      .join(', ');
  }, [brigadas, brigadaSelection.selectedArray]);

  useEffect(() => {
    if (!show) {
      brigadaSelection.clear();
      setShowWizard(false);
      setQuickDispatchOpen(false);
      setDispatchError('');
      return;
    }
    setLoading(true);
    setLoadError('');
    fetchDespachoCola()
      .then((r) => setBrigadas(r.brigadasDisponibles))
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Error al cargar brigadas'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset al abrir
  }, [show]);

  const handleClose = () => {
    if (quickDispatching) return;
    brigadaSelection.clear();
    setShowWizard(false);
    onHide();
  };

  const handleDespachoRapido = async () => {
    if (brigadaSelection.count === 0) return;
    setQuickDispatching(true);
    setDispatchError('');
    try {
      await ejecutarDespachoRapido(incidenteId, brigadaSelection.selectedArray, despachadoPor);
      setQuickDispatchOpen(false);
      brigadaSelection.clear();
      onSuccess();
      onHide();
    } catch (e) {
      setDispatchError(e instanceof Error ? e.message : 'Error al despachar');
      setQuickDispatchOpen(false);
    } finally {
      setQuickDispatching(false);
    }
  };

  if (showWizard) {
    return (
      <DespachoWizard
        show
        brigadaIds={brigadaSelection.selectedArray}
        despachadoPor={despachadoPor}
        incidenteIdPreseleccionado={incidenteId}
        onHide={() => {
          setShowWizard(false);
        }}
        onSuccess={() => {
          brigadaSelection.clear();
          onSuccess();
          onHide();
        }}
      />
    );
  }

  return (
    <>
      <RevModal show={show} onHide={handleClose} title="Despachar brigada" size="lg">
        <div className="rev-despacho-wizard-confirm__incidente mb-3">
          <div className="rev-despacho-wizard-confirm__incidente-label">Incidente</div>
          <div className="rev-despacho-wizard-confirm__incidente-folio">
            {incidenteFolio ?? incidenteId.slice(0, 8)}
          </div>
          {(incidenteTipo || incidenteDescripcion) && (
            <p className="rev-despacho-wizard-confirm__incidente-desc mb-0">
              {[incidenteTipo, incidenteDescripcion].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <p className="small text-muted mb-3">
          Seleccione una o más brigadas y elija despacho con asistente o despacho rápido.
        </p>

        {loadError && (
          <Alert variant="danger" className="small py-2">
            {loadError}
          </Alert>
        )}

        {loading ? (
          <p className="text-muted small d-flex align-items-center gap-2 mb-0">
            <span className="spinner-border spinner-border-sm" role="status" />
            Cargando brigadas disponibles…
          </p>
        ) : (
          <>
            <BrigadaSeleccionList
              brigadas={brigadas}
              selection={brigadaSelection}
              onToggle={() => setDispatchError('')}
            />
            {dispatchError && (
              <Alert variant="danger" className="small py-2 mt-2 mb-0">
                {dispatchError}
              </Alert>
            )}
            <BrigadaBulkActionBar
              count={brigadaSelection.count}
              onDespachar={() => setShowWizard(true)}
              onDespachoRapido={() => {
                setDispatchError('');
                setQuickDispatchOpen(true);
              }}
              despachoRapidoLoading={quickDispatching}
              onClear={brigadaSelection.clear}
            />
          </>
        )}

        <div className="d-flex justify-content-end mt-3 pt-2 border-top">
          <Button variant="outline-secondary" size="sm" onClick={handleClose} disabled={quickDispatching}>
            Cancelar
          </Button>
        </div>
      </RevModal>

      <ConfirmDialog
        show={quickDispatchOpen}
        title="Despacho rápido"
        message={`Se despachará ${incidenteFolio ?? 'el incidente'} con dotación completa hacia: ${brigadasSeleccionadasNombres || 'las brigadas seleccionadas'}.`}
        confirmLabel="Sí, despachar"
        cancelLabel="Seguir revisando"
        variant="primary"
        onConfirm={() => void handleDespachoRapido()}
        onCancel={() => setQuickDispatchOpen(false)}
      />
    </>
  );
}
