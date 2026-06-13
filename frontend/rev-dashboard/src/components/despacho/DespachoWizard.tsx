import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, ListGroup } from 'react-bootstrap';
import {
  asignarDespachoLote,
  fetchBrigadaDetalle,
  fetchDespachoCola,
  type DespachoAsignarLoteResponse,
  type DespachoColaItem,
} from '../../api';
import {
  createDraftFromDetalle,
  draftToAsignarItem,
  validateDraftForDespacho,
  type DespachoBrigadaDraft,
} from '../../utils/despachoWizardState';
import ConfirmDialog from '../primitives/ConfirmDialog';
import RevModal from '../primitives/RevModal';
import DespachoCompositionSummary from './DespachoCompositionSummary';
import DespachoTreeCheckbox from './DespachoTreeCheckbox';
import { DESPACHO_WIZARD_STEPS } from './despachoWizardSteps';

const STEPS = [...DESPACHO_WIZARD_STEPS, 'Resultado'] as const;
const LAST_FORM_STEP = STEPS.length - 2;

interface DespachoWizardProps {
  show: boolean;
  brigadaIds: number[];
  despachadoPor: string;
  incidenteIdPreseleccionado?: string | null;
  onHide: () => void;
  onSuccess: () => void;
}

export default function DespachoWizard({
  show,
  brigadaIds,
  despachadoPor,
  incidenteIdPreseleccionado,
  onHide,
  onSuccess,
}: DespachoWizardProps) {
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<DespachoBrigadaDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cola, setCola] = useState<DespachoColaItem[]>([]);
  const [colaLoading, setColaLoading] = useState(false);
  const [incidenteId, setIncidenteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loteResult, setLoteResult] = useState<DespachoAsignarLoteResponse | null>(null);
  const [confirmDespachoOpen, setConfirmDespachoOpen] = useState(false);

  const incidenteSeleccionado = useMemo(
    () => cola.find((c) => c.incidenteId === incidenteId) ?? null,
    [cola, incidenteId],
  );

  const composicionError = useMemo(
    () => drafts.map(validateDraftForDespacho).find((msg) => msg != null) ?? null,
    [drafts],
  );

  const incidenteFijado = !!incidenteIdPreseleccionado;

  const reset = useCallback(() => {
    setStep(incidenteIdPreseleccionado ? 1 : 0);
    setDrafts([]);
    setError('');
    setLoteResult(null);
    setConfirmDespachoOpen(false);
    setIncidenteId(incidenteIdPreseleccionado ?? null);
  }, [incidenteIdPreseleccionado]);

  useEffect(() => {
    if (!show) return;
    reset();
    setLoading(true);
    Promise.all(brigadaIds.map((id) => fetchBrigadaDetalle(id)))
      .then((detalles) => setDrafts(detalles.map(createDraftFromDetalle)))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar brigadas'))
      .finally(() => setLoading(false));

    setColaLoading(true);
    fetchDespachoCola()
      .then((r) => setCola(r.cola))
      .catch(() => setCola([]))
      .finally(() => setColaLoading(false));
  }, [show, brigadaIds, reset]);

  useEffect(() => {
    if (show && incidenteIdPreseleccionado) {
      setIncidenteId(incidenteIdPreseleccionado);
    }
  }, [show, incidenteIdPreseleccionado]);

  const updateDraft = (index: number, draft: DespachoBrigadaDraft) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? draft : d)));
  };

  const canNext = (): boolean => {
    if (step === 0) return !!incidenteId;
    if (step === 1) return composicionError == null;
    return true;
  };

  const handleDespachar = async () => {
    if (!incidenteId) return;
    const validation = drafts.map(validateDraftForDespacho).find((msg) => msg != null);
    if (validation) {
      setError(validation);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await asignarDespachoLote({
        incidenteId,
        despachadoPor,
        items: drafts.map(draftToAsignarItem),
      });
      setLoteResult(res);
      setStep(STEPS.length - 1);
      if (res.exitosos > 0) onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al despachar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === LAST_FORM_STEP) {
      setConfirmDespachoOpen(true);
      return;
    }
    if (step < LAST_FORM_STEP) setStep((s) => s + 1);
  };

  const confirmDespachoMessage = useMemo(() => {
    const folio = incidenteSeleccionado?.folio ?? incidenteId ?? '—';
    const brigadas = drafts.map((d) => d.nombre).join(', ');
    return `¿Confirma el despacho de ${drafts.length} brigada${drafts.length !== 1 ? 's' : ''} (${brigadas}) al incidente ${folio}?`;
  }, [drafts, incidenteId, incidenteSeleccionado]);

  const handleBack = () => {
    if (step === 1 && incidenteFijado) {
      onHide();
      return;
    }
    if (step > 0 && step < STEPS.length - 1) setStep((s) => s - 1);
  };

  const isResultStep = step === STEPS.length - 1;

  return (
    <RevModal
      show={show}
      onHide={onHide}
      title="Despachar brigadas a incidente"
      size="lg"
    >
      <div className="rev-dotacion-wizard__steps mb-3" aria-label="Pasos del asistente">
        {STEPS.map((label, i) => {
          const done = i < step || (incidenteFijado && i === 0);
          const active = i === step;
          return (
          <span
            key={label}
            className={`rev-dotacion-wizard__step${active ? ' active' : ''}${done ? ' done' : ''}`}
            aria-current={active ? 'step' : undefined}
          >
            {i + 1}. {label}
          </span>
          );
        })}
      </div>

      {error && (
        <Alert variant="danger" className="py-2 small">
          {error}
        </Alert>
      )}

      {loading && <p className="text-muted small">Cargando dotación de brigadas…</p>}

      {!loading && !isResultStep && (
        <>
          {step === 0 && !incidenteFijado && (
            <div>
              <p className="small text-muted">
                Seleccione el incidente de la cola operativa ({brigadaIds.length} brigada
                {brigadaIds.length !== 1 ? 's' : ''}).
              </p>
              {colaLoading ? (
                <p className="text-muted small">Cargando cola…</p>
              ) : cola.length === 0 ? (
                <Alert variant="warning" className="small">
                  No hay incidentes en cola. Registre o active incidentes antes de despachar.
                </Alert>
              ) : (
                <ListGroup className="rev-despacho-wizard-cola">
                  {cola.map((item) => {
                    const selected = incidenteId === item.incidenteId;
                    return (
                    <ListGroup.Item
                      key={item.incidenteId}
                      className={`rev-despacho-wizard-cola-item${selected ? ' rev-despacho-wizard-cola-item--selected' : ''}`}
                      onClick={() => setIncidenteId(item.incidenteId)}
                    >
                      <div className="rev-despacho-wizard-cola-item__head">
                        {item.folio ?? item.incidenteId.slice(0, 8)}
                        <span className="ms-2 badge bg-secondary">{item.estado}</span>
                      </div>
                      <div className="rev-despacho-wizard-cola-item__desc">
                        {item.tipo} · {item.descripcion}
                      </div>
                    </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="small text-muted mb-3">
                Ajuste integrantes, vehículos (plazas se suman; marque <strong>Prioritario</strong> el de salida) y kit.
              </p>
              {composicionError && (
                <Alert variant="warning" className="small py-2">
                  {composicionError}
                </Alert>
              )}
              {drafts.map((d, i) => (
                <DespachoTreeCheckbox
                  key={d.brigadaId}
                  draft={d}
                  editable
                  onChange={(next) => updateDraft(i, next)}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="rev-despacho-wizard-confirm">
              <p className="small text-muted mb-3">
                Revise el resumen antes de despachar. Use <strong>Atrás</strong> si necesita modificar la composición.
              </p>
              <div className="rev-despacho-wizard-confirm__incidente">
                <div className="rev-despacho-wizard-confirm__incidente-label">Incidente</div>
                <div className="rev-despacho-wizard-confirm__incidente-folio">
                  {incidenteSeleccionado?.folio ?? incidenteId}
                  {incidenteSeleccionado?.estado && (
                    <span className="badge bg-secondary ms-2">{incidenteSeleccionado.estado}</span>
                  )}
                </div>
                {incidenteSeleccionado?.descripcion && (
                  <p className="rev-despacho-wizard-confirm__incidente-desc mb-0">
                    {incidenteSeleccionado.tipo} · {incidenteSeleccionado.descripcion}
                  </p>
                )}
              </div>
              {drafts.map((d) => (
                <DespachoCompositionSummary key={d.brigadaId} draft={d} />
              ))}
            </div>
          )}
        </>
      )}

      {isResultStep && loteResult && (
        <div>
          <Alert variant={loteResult.fallidos === 0 ? 'success' : 'warning'} className="small">
            {loteResult.exitosos} exitoso{loteResult.exitosos !== 1 ? 's' : ''},{' '}
            {loteResult.fallidos} fallido{loteResult.fallidos !== 1 ? 's' : ''}.
          </Alert>
          <ul className="small mb-0">
            {loteResult.resultados.map((r) => (
              <li key={r.brigadaId}>
                Brigada {r.brigadaId}: {r.ok ? 'OK' : r.mensaje ?? 'Error'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="d-flex justify-content-between mt-4 pt-2 border-top">
        <Button
          variant="outline-secondary"
          onClick={isResultStep ? onHide : step === 0 ? onHide : handleBack}
          disabled={submitting}
        >
          {isResultStep || step === 0 ? 'Cerrar' : 'Atrás'}
        </Button>
        {!isResultStep && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={loading || submitting || !canNext()}
          >
            {submitting
              ? 'Despachando…'
              : step === LAST_FORM_STEP
                ? 'Despachar'
                : 'Siguiente'}
          </Button>
        )}
      </div>

      <ConfirmDialog
        show={confirmDespachoOpen}
        title="Confirmar despacho"
        message={confirmDespachoMessage}
        confirmLabel="Sí, despachar"
        cancelLabel="Seguir revisando"
        variant="primary"
        onConfirm={() => {
          setConfirmDespachoOpen(false);
          void handleDespachar();
        }}
        onCancel={() => setConfirmDespachoOpen(false)}
      />
    </RevModal>
  );
}
