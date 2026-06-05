import { FormEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { CompaniaItem, InstitucionItem, createBrigada, fetchCompanias, fetchInstituciones } from '../../../api';
import { BRIGADA_CUPO_PRESETS } from '../../../utils/recursosAltaConfig';
import { RECURSOS_GLOSARIO } from '../../../utils/recursosLabels';
import AltaWizardShell, { AltaTipBox } from './AltaWizardShell';

const STEPS = ['Identidad', 'Organización', 'Cupo', 'Confirmar'] as const;
const FORM_ID = 'alta-brigada-form';

interface AltaBrigadaWizardProps {
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
  onAltaError?: (message: string) => void;
}

export default function AltaBrigadaWizard({ show, onHide, onSaved, onAltaError }: AltaBrigadaWizardProps) {
  const [step, setStep] = useState(0);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [idCompania, setIdCompania] = useState<number | ''>('');
  const [capacidad, setCapacidad] = useState('8');
  const [companias, setCompanias] = useState<CompaniaItem[]>([]);
  const [instituciones, setInstituciones] = useState<InstitucionItem[]>([]);
  const [idInstitucion, setIdInstitucion] = useState<number | ''>('');
  const [loadingComp, setLoadingComp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) {
      setStep(0);
      setNombre('');
      setCodigo('');
      setIdCompania('');
      setIdInstitucion('');
      setCapacidad('8');
      setError('');
      return;
    }
    setLoadingComp(true);
    Promise.all([fetchCompanias(), fetchInstituciones()])
      .then(([compList, instList]) => {
        setCompanias(compList);
        setInstituciones(instList);
        if (instList.length === 1) setIdInstitucion(instList[0].id);
        const filtered =
          instList.length === 1
            ? compList.filter((c) => c.idInstitucion === instList[0].id)
            : compList;
        if (filtered.length === 1) setIdCompania(filtered[0].id);
      })
      .catch(() => setCompanias([]))
      .finally(() => setLoadingComp(false));
  }, [show]);

  const canNext =
    (step === 0 && nombre.trim()) ||
    step === 1 ||
    (step === 2 && Number(capacidad) > 0) ||
    step === 3;

  const companiasFiltradas =
    idInstitucion !== ''
      ? companias.filter((c) => c.idInstitucion === Number(idInstitucion))
      : companias;

  const companiaSel = companiasFiltradas.find((c) => c.id === Number(idCompania));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createBrigada({
        nombre: nombre.trim(),
        capacidad: Number(capacidad),
        codigo: codigo.trim() || undefined,
        idCompania: idCompania !== '' ? Number(idCompania) : undefined,
      });
      onSaved();
      onHide();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear brigada';
      setError(msg);
      onAltaError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AltaWizardShell
      show={show}
      onHide={onHide}
      title="Crear brigada operativa"
      steps={STEPS}
      step={step}
      setStep={setStep}
      saving={saving}
      error={error}
      canNext={Boolean(canNext)}
      onSubmit={handleSubmit}
      submitLabel="Crear brigada"
      formId={FORM_ID}
      tip={
        <AltaTipBox title="Jerarquía REV">
          <p className="small mb-2">{RECURSOS_GLOSARIO.dotacion}</p>
          <p className="small mb-0">
            Tras crear la brigada, use <strong>Configurar dotación</strong> para asignar jefe,
            integrantes, vehículos y kit antes del despacho.
          </p>
        </AltaTipBox>
      }
    >
      {step === 0 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la brigada</Form.Label>
            <Form.Control
              placeholder="Ej. Brigada Municipal Rápida"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Código interno (opcional)</Form.Label>
            <Form.Control
              placeholder="RAPIDA-01"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            />
            <Form.Text>Identificador corto para despacho y reportes.</Form.Text>
          </Form.Group>
        </>
      )}
      {step === 1 && (
        <>
          {loadingComp ? (
            <p className="text-muted small">Cargando compañías…</p>
          ) : companias.length === 0 ? (
            <p className="text-muted small mb-0">
              No hay compañías en catálogo. La brigada se creará sin vínculo organizacional; puede
              editarse después.
            </p>
          ) : (
            <>
              {instituciones.length > 1 && (
                <>
                  <Form.Label className="mb-2">Institución</Form.Label>
                  <div className="rev-alta-compania-list mb-3">
                    {instituciones.map((inst) => (
                      <button
                        key={inst.id}
                        type="button"
                        className={`rev-alta-compania-card${idInstitucion === inst.id ? ' rev-alta-compania-card--active' : ''}`}
                        onClick={() => {
                          setIdInstitucion(inst.id);
                          setIdCompania('');
                        }}
                      >
                        <span className="rev-alta-compania-card__name">{inst.nombre}</span>
                        <span className="rev-alta-compania-card__meta">{inst.codigo}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <Form.Label className="mb-2">Compañía / base</Form.Label>
              <div className="rev-alta-compania-list">
                {companiasFiltradas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`rev-alta-compania-card${idCompania === c.id ? ' rev-alta-compania-card--active' : ''}`}
                    onClick={() => setIdCompania(c.id)}
                  >
                    <span className="rev-alta-compania-card__name">{c.nombre}</span>
                    <span className="rev-alta-compania-card__meta">
                      {c.codigo}
                      {c.nombreComuna ? ` · ${c.nombreComuna}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <Form.Label className="mb-2">Cupo máximo de integrantes</Form.Label>
          <div className="rev-alta-cupo-presets mb-3">
            {BRIGADA_CUPO_PRESETS.map((p) => (
              <button
                key={p.capacidad}
                type="button"
                className={`rev-alta-cupo-card${Number(capacidad) === p.capacidad ? ' rev-alta-cupo-card--active' : ''}`}
                onClick={() => setCapacidad(String(p.capacidad))}
              >
                <span className="rev-alta-cupo-card__num">{p.capacidad}</span>
                <span className="rev-alta-cupo-card__label">{p.label}</span>
                <span className="rev-alta-cupo-card__desc">{p.desc}</span>
              </button>
            ))}
          </div>
          <Form.Group className="mb-0">
            <Form.Label>Valor personalizado</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={50}
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
            />
          </Form.Group>
        </>
      )}
      {step === 3 && (
        <dl className="rev-alta-resumen mb-0">
          <dt>Nombre</dt>
          <dd>{nombre}</dd>
          <dt>Código</dt>
          <dd>{codigo.trim() || '—'}</dd>
          <dt>Compañía</dt>
          <dd>{companiaSel?.nombre ?? 'Sin asignar'}</dd>
          <dt>Cupo máximo</dt>
          <dd>{capacidad} integrantes</dd>
        </dl>
      )}
    </AltaWizardShell>
  );
}
