import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import {
  BrigadaComposicionPayload,
  BrigadaElegibilidad,
  RecursosCatalogo,
  fetchBrigadaDetalle,
  fetchBrigadaElegibilidad,
  updateBrigadaComposicion,
} from '../../api';
import {
  DOTACION_WIZARD_STEPS,
  RECURSOS_GLOSARIO,
} from '../../utils/recursosLabels';
import { groupBrigadistasByBrigada } from '../../utils/recursosUtils';
import RevModal from '../primitives/RevModal';
import BrigadaDespachoChecklist from './BrigadaDespachoChecklist';

const STEPS = [...DOTACION_WIZARD_STEPS];
const LAST_STEP = STEPS.length - 1;

interface DotacionWizardProps {
  show: boolean;
  brigadaId: number | null;
  catalogo: RecursosCatalogo | null;
  onHide: () => void;
  onSaved: () => void;
  onElegibilidadRefresh?: (brigadaId: number) => void;
}

export default function DotacionWizard({
  show,
  brigadaId,
  catalogo,
  onHide,
  onSaved,
  onElegibilidadRefresh,
}: DotacionWizardProps) {
  const [step, setStep] = useState(0);
  const [jefeId, setJefeId] = useState<number | ''>('');
  const [brigadistaIds, setBrigadistaIds] = useState<number[]>([]);
  const [vehiculoIds, setVehiculoIds] = useState<number[]>([]);
  const [principalVehiculoId, setPrincipalVehiculoId] = useState<number | ''>('');
  const [herramientas, setHerramientas] = useState<Record<number, number>>({});
  const [capacidad, setCapacidad] = useState(0);
  const [nombreBrigada, setNombreBrigada] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedOk, setSavedOk] = useState(false);
  const [elegibilidad, setElegibilidad] = useState<BrigadaElegibilidad | null>(null);
  const [elegibilidadLoading, setElegibilidadLoading] = useState(false);

  const refreshElegibilidad = useCallback(async (id: number) => {
    setElegibilidadLoading(true);
    try {
      const e = await fetchBrigadaElegibilidad(id);
      setElegibilidad(e);
      onElegibilidadRefresh?.(id);
    } catch {
      setElegibilidad(null);
    } finally {
      setElegibilidadLoading(false);
    }
  }, [onElegibilidadRefresh]);

  useEffect(() => {
    if (!show) {
      setStep(0);
      setSavedOk(false);
      setElegibilidad(null);
      return;
    }
    if (brigadaId == null) return;
    setLoading(true);
    setError('');
    setSavedOk(false);
    fetchBrigadaDetalle(brigadaId)
      .then((d) => {
        setNombreBrigada(d.nombre);
        setCapacidad(d.capacidad);
        setJefeId(d.idJefeBrigadista ?? '');
        setBrigadistaIds(d.brigadistas.map((b) => b.id));
        const vIds = (d.vehiculos ?? []).map((v) => v.vehiculoId);
        setVehiculoIds(vIds.length ? vIds : d.vehiculoId != null ? [d.vehiculoId] : []);
        const principal = (d.vehiculos ?? []).find((v) => v.principal)?.vehiculoId ?? d.vehiculoId;
        setPrincipalVehiculoId(principal ?? '');
        const map: Record<number, number> = {};
        d.herramientas.forEach((h) => {
          map[h.herramientaId] = h.cantidad;
        });
        setHerramientas(map);
        return refreshElegibilidad(brigadaId);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [show, brigadaId, refreshElegibilidad]);

  useEffect(() => {
    if (step === LAST_STEP && brigadaId != null && !savedOk) {
      refreshElegibilidad(brigadaId);
    }
  }, [step, brigadaId, savedOk, refreshElegibilidad]);

  const integranteCount =
    jefeId && !brigadistaIds.includes(Number(jefeId))
      ? brigadistaIds.length + 1
      : brigadistaIds.length;

  const kitVacio = Object.keys(herramientas).length === 0;

  const brigadistaGrupos = useMemo(() => {
    if (!catalogo) return [];
    return groupBrigadistasByBrigada(catalogo.brigadistas, catalogo.brigadas, brigadaId);
  }, [catalogo, brigadaId]);

  const toggleBrigadista = (id: number) => {
    setBrigadistaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleVehiculo = (id: number) => {
    setVehiculoIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!next.includes(Number(principalVehiculoId)) && next.length > 0) {
        setPrincipalVehiculoId(next[0]);
      }
      return next;
    });
  };

  const buildPayload = (): BrigadaComposicionPayload => {
    const ids =
      jefeId && !brigadistaIds.includes(Number(jefeId))
        ? [...brigadistaIds, Number(jefeId)]
        : brigadistaIds;
    return {
      jefeBrigadistaId: jefeId ? Number(jefeId) : null,
      brigadistaIds: ids,
      vehiculoIds: vehiculoIds.length ? vehiculoIds : undefined,
      principalVehiculoId: principalVehiculoId ? Number(principalVehiculoId) : vehiculoIds[0],
      vehiculoId: principalVehiculoId ? Number(principalVehiculoId) : vehiculoIds[0] ?? null,
      herramientas: Object.entries(herramientas).map(([hid, cantidad]) => ({
        herramientaId: Number(hid),
        cantidad,
      })),
    };
  };

  const validateBeforeSave = (): string | null => {
    if (jefeId === '') return 'Seleccione jefe de brigada.';
    if (integranteCount === 0) return 'Seleccione al menos un integrante.';
    if (integranteCount > capacidad) {
      return `Los integrantes (${integranteCount}) superan el cupo máximo (${capacidad}).`;
    }
    if (vehiculoIds.length === 0) return 'Asigne al menos un vehículo de dotación.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (brigadaId == null) return;
    const validation = validateBeforeSave();
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateBrigadaComposicion(brigadaId, buildPayload());
      onSaved();
      setSavedOk(true);
      setStep(LAST_STEP);
      await refreshElegibilidad(brigadaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar dotación');
    } finally {
      setSaving(false);
    }
  };

  const goToReview = () => {
    const validation = validateBeforeSave();
    if (validation) {
      setError(validation);
      return;
    }
    setError('');
    setStep(LAST_STEP);
  };

  const canNext =
    step === 0 ||
    (step === 1 && jefeId !== '' && integranteCount > 0 && integranteCount <= capacidad) ||
    (step === 2 && vehiculoIds.length > 0) ||
    step === 3;

  const isReviewStep = step === LAST_STEP;

  return (
    <RevModal
      show={show}
      onHide={onHide}
      title={`Dotar brigada: ${nombreBrigada || 'Brigada'}`}
      size="lg"
      footer={
        <>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            {savedOk && isReviewStep ? 'Cerrar' : 'Cancelar'}
          </Button>
          {step > 0 && !savedOk && (
            <Button variant="outline-primary" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              Atrás
            </Button>
          )}
          {!isReviewStep && step < STEPS.length - 2 ? (
            <Button
              variant="primary"
              disabled={!canNext || loading}
              onClick={() => setStep((s) => s + 1)}
            >
              Siguiente
            </Button>
          ) : !isReviewStep && step === STEPS.length - 2 ? (
            <Button variant="primary" disabled={!canNext || loading} onClick={goToReview}>
              Revisar y guardar
            </Button>
          ) : !savedOk ? (
            <Button variant="success" type="submit" form="dotacion-wizard-form" disabled={saving || loading}>
              {saving ? 'Guardando…' : 'Guardar dotación'}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="rev-dotacion-wizard__steps mb-3">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rev-dotacion-wizard__step${i === step ? ' active' : i < step ? ' done' : ''}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {savedOk && isReviewStep && (
        <Alert variant="success" className="small">
          Dotación guardada correctamente.
        </Alert>
      )}
      {loading ? (
        <p className="text-muted">Cargando dotación…</p>
      ) : (
        <Form id="dotacion-wizard-form" onSubmit={handleSubmit}>
          {step === 0 && (
            <>
              <p className="mb-2">
                Brigada <strong>{nombreBrigada}</strong>
              </p>
              <p className="small text-muted mb-0" title={RECURSOS_GLOSARIO.cupoMaximo}>
                <strong>Cupo máximo:</strong> {capacidad} integrantes
              </p>
            </>
          )}
          {step === 1 && catalogo && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Jefe de brigada</Form.Label>
                <Form.Select
                  value={jefeId}
                  onChange={(e) => setJefeId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Seleccione…</option>
                  {brigadistaGrupos.map((g) => (
                    <optgroup
                      key={`jefe-grp-${g.brigadaId ?? 'none'}`}
                      label={`${g.brigadaNombre}${g.brigadaId === brigadaId ? ' (esta brigada)' : ''}`}
                    >
                      {g.brigadistas.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre} {b.apellido}
                          {b.rolNombre ? ` — ${b.rolNombre}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Label>
                Integrantes{' '}
                <span className="text-muted">
                  ({integranteCount} / {capacidad})
                </span>
              </Form.Label>
              <div className="rev-dotacion-wizard__checks">
                {brigadistaGrupos.map((g) => (
                  <div key={`dot-grp-${g.brigadaId ?? 'none'}`} className="rev-dotacion-wizard__group">
                    <div className="rev-dotacion-wizard__group-head">
                      <span>{g.brigadaNombre}</span>
                      {g.brigadaCodigo && (
                        <span className="rev-dotacion-wizard__group-meta">{g.brigadaCodigo}</span>
                      )}
                      {g.brigadaId === brigadaId && (
                        <span className="rev-dotacion-wizard__group-tag">Esta brigada</span>
                      )}
                    </div>
                    {g.brigadistas.map((b) => (
                      <Form.Check
                        key={b.id}
                        type="checkbox"
                        id={`dot-b-${b.id}`}
                        label={`${b.nombre} ${b.apellido}${b.rolNombre ? ` (${b.rolNombre})` : ''}`}
                        checked={brigadistaIds.includes(b.id)}
                        onChange={() => toggleBrigadista(b.id)}
                        disabled={
                          !brigadistaIds.includes(b.id) &&
                          integranteCount >= capacidad &&
                          Number(jefeId) !== b.id
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 2 && catalogo && (
            <>
              <Form.Label>Vehículos de dotación</Form.Label>
              <div className="rev-dotacion-wizard__checks mb-3">
                {catalogo.vehiculos.map((v) => (
                  <Form.Check
                    key={v.id}
                    type="checkbox"
                    id={`dot-v-${v.id}`}
                    label={`${v.patente} (${v.tipo})`}
                    checked={vehiculoIds.includes(v.id)}
                    onChange={() => toggleVehiculo(v.id)}
                  />
                ))}
              </div>
              {vehiculoIds.length > 1 && (
                <Form.Group>
                  <Form.Label>Vehículo principal</Form.Label>
                  <Form.Select
                    value={principalVehiculoId}
                    onChange={(e) => setPrincipalVehiculoId(Number(e.target.value))}
                  >
                    {vehiculoIds.map((vid) => {
                      const v = catalogo.vehiculos.find((x) => x.id === vid);
                      return (
                        <option key={vid} value={vid}>
                          {v?.patente ?? vid}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              )}
            </>
          )}
          {step === 3 && catalogo && (
            <>
              <Form.Label>Kit operativo</Form.Label>
              {kitVacio && (
                <Alert variant="info" className="small py-2">
                  Sin herramientas en el kit. Puede guardar igual; algunas operaciones recomiendan
                  dotar equipo básico.
                </Alert>
              )}
              {catalogo.herramientas.map((h) => (
                <Form.Group key={h.id} className="mb-2 d-flex align-items-center gap-2">
                  <span className="flex-grow-1">{h.nombre}</span>
                  <Form.Control
                    type="number"
                    min={0}
                    max={h.cantidadDisponible}
                    style={{ width: 80 }}
                    value={herramientas[h.id] ?? 0}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setHerramientas((prev) => {
                        const next = { ...prev };
                        if (n <= 0) delete next[h.id];
                        else next[h.id] = n;
                        return next;
                      });
                    }}
                  />
                </Form.Group>
              ))}
            </>
          )}
          {isReviewStep && (
            <div>
              <p className="small text-muted mb-3">{RECURSOS_GLOSARIO.listaDespacho}</p>
              {!savedOk && (
                <p className="mb-3">
                  Revise la elegibilidad. Pulse <strong>Guardar dotación</strong> para persistir los
                  cambios.
                </p>
              )}
              <BrigadaDespachoChecklist
                elegibilidad={elegibilidad}
                loading={elegibilidadLoading}
              />
            </div>
          )}
        </Form>
      )}
    </RevModal>
  );
}
