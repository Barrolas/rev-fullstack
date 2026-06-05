import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, ListGroup } from 'react-bootstrap';
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
  type DespachoBrigadaDraft,
} from '../../utils/despachoWizardState';
import RevModal from '../primitives/RevModal';
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

  const incidenteSeleccionado = useMemo(
    () => cola.find((c) => c.incidenteId === incidenteId) ?? null,
    [cola, incidenteId],
  );

  const reset = useCallback(() => {
    setStep(0);
    setDrafts([]);
    setError('');
    setLoteResult(null);
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
    if (step === 3) {
      return drafts.every((d) => {
        if (d.vehiculoIds.size <= 1) return true;
        return d.principalVehiculoId != null && d.vehiculoIds.has(d.principalVehiculoId);
      });
    }
    return true;
  };

  const handleDespachar = async () => {
    if (!incidenteId) return;
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
      void handleDespachar();
      return;
    }
    if (step < LAST_FORM_STEP) setStep((s) => s + 1);
  };

  const handleBack = () => {
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
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rev-dotacion-wizard__step${i === step ? ' rev-dotacion-wizard__step--active' : ''}${i < step ? ' rev-dotacion-wizard__step--done' : ''}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {error && (
        <Alert variant="danger" className="py-2 small">
          {error}
        </Alert>
      )}

      {loading && <p className="text-muted small">Cargando dotación de brigadas…</p>}

      {!loading && !isResultStep && (
        <>
          {step === 0 && (
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
                  {cola.map((item) => (
                    <ListGroup.Item
                      key={item.incidenteId}
                      action
                      active={incidenteId === item.incidenteId}
                      onClick={() => setIncidenteId(item.incidenteId)}
                    >
                      <div className="fw-semibold">
                        {item.folio ?? item.incidenteId.slice(0, 8)}
                        <span className="ms-2 badge bg-secondary">{item.estado}</span>
                      </div>
                      <div className="small text-muted">{item.tipo} · {item.descripcion}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="small text-muted mb-3">
                Revise la selección. Si está correcta, pulse <strong>Siguiente</strong> para ajustar
                excepciones en la composición.
              </p>
              {drafts.map((d) => (
                <DespachoTreeCheckbox key={d.brigadaId} draft={d} editable={false} />
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="small text-muted mb-3">
                Todo el kit viene marcado por defecto. Desmarque solo las excepciones de esta salida.
              </p>
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

          {step === 3 && (
            <div>
              <p className="small text-muted mb-3">
                Confirme el vehículo principal cuando hay más de un vehículo en la salida.
              </p>
              {drafts.map((d, i) => (
                <div key={d.brigadaId} className="rev-despacho-wizard-veh mb-3">
                  <div className="fw-semibold mb-2">{d.nombre}</div>
                  {[...d.vehiculoIds].length <= 1 ? (
                    <p className="small text-muted mb-0">
                      {d.principalVehiculoId
                        ? `Vehículo único: ${d.detalle.vehiculos?.find((v) => v.vehiculoId === d.principalVehiculoId)?.patente ?? d.principalVehiculoId}`
                        : 'Sin vehículo en composición'}
                    </p>
                  ) : (
                    <Form.Select
                      size="sm"
                      value={d.principalVehiculoId ?? ''}
                      onChange={(e) => {
                        const next = { ...d, principalVehiculoId: Number(e.target.value) };
                        updateDraft(i, next);
                      }}
                    >
                      <option value="" disabled>
                        Elija principal…
                      </option>
                      {[...d.vehiculoIds].map((vid) => {
                        const v = d.detalle.vehiculos?.find((x) => x.vehiculoId === vid);
                        return (
                          <option key={vid} value={vid}>
                            {v?.patente ?? vid} {v?.tipo ? `· ${v.tipo}` : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="small mb-2">
                <strong>Incidente:</strong>{' '}
                {incidenteSeleccionado?.folio ?? incidenteId}
              </p>
              {drafts.map((d) => (
                <DespachoTreeCheckbox key={d.brigadaId} draft={d} editable={false} />
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
    </RevModal>
  );
}
