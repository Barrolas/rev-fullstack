import { FormEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { BrigadistaRolItem, createBrigadista, fetchBrigadistaRoles } from '../../../api';
import { ESPECIALIDADES_SUGERIDAS } from '../../../utils/recursosAltaConfig';
import AltaWizardShell, { AltaQuickChips, AltaTipBox } from './AltaWizardShell';

const STEPS = ['Identidad', 'Rol operativo', 'Perfil', 'Confirmar'] as const;
const FORM_ID = 'alta-brigadista-form';

interface AltaBrigadistaWizardProps {
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
  onAltaError?: (message: string) => void;
}

export default function AltaBrigadistaWizard({ show, onHide, onSaved, onAltaError }: AltaBrigadistaWizardProps) {
  const [step, setStep] = useState(0);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rut, setRut] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [roles, setRoles] = useState<BrigadistaRolItem[]>([]);
  const [idRol, setIdRol] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) {
      setStep(0);
      setNombre('');
      setApellido('');
      setRut('');
      setEspecialidad('');
      setIdRol('');
      setError('');
      return;
    }
    fetchBrigadistaRoles()
      .then((list) => {
        setRoles(list);
        const combatiente = list.find((r) => r.codigo === 'COMBATIENTE');
        if (combatiente) setIdRol(combatiente.id);
      })
      .catch(() => setRoles([]));
  }, [show]);

  const rolSel = roles.find((r) => r.id === Number(idRol));

  const canNext =
    (step === 0 && nombre.trim() && apellido.trim()) ||
    (step === 1 && idRol !== '') ||
    step === 2 ||
    step === 3;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createBrigadista({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rut: rut.trim() || undefined,
        especialidad: especialidad.trim() || undefined,
        idRolBrigadista: idRol !== '' ? Number(idRol) : undefined,
      });
      onSaved();
      onHide();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar brigadista';
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
      title="Agregar brigadista"
      steps={STEPS}
      step={step}
      setStep={setStep}
      saving={saving}
      error={error}
      canNext={Boolean(canNext)}
      onSubmit={handleSubmit}
      submitLabel="Registrar brigadista"
      formId={FORM_ID}
      tip={
        <AltaTipBox title="Rol vs dotación">
          <p className="small mb-2">
            El <strong>rol operativo</strong> orienta el perfil del brigadista. La asignación a
            una brigada concreta se hace en <strong>Configurar dotación</strong>.
          </p>
          <p className="small mb-0">
            Solo un integrante por brigada puede ser <strong>Jefe</strong> al momento del despacho.
          </p>
        </AltaTipBox>
      }
    >
      {step === 0 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>RUT (opcional)</Form.Label>
            <Form.Control
              placeholder="12.345.678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
            />
          </Form.Group>
        </>
      )}
      {step === 1 && (
        <>
          <Form.Label className="mb-2">Rol en operaciones</Form.Label>
          <div className="rev-alta-compania-list">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`rev-alta-compania-card${idRol === r.id ? ' rev-alta-compania-card--active' : ''}`}
                onClick={() => setIdRol(r.id)}
              >
                <span className="rev-alta-compania-card__name">{r.nombre}</span>
                <span className="rev-alta-compania-card__meta">{r.codigo}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Especialidad</Form.Label>
            <Form.Control
              placeholder="Ej. Combate forestal, Primeros auxilios…"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
          </Form.Group>
          <Form.Label className="small text-muted">Selección rápida</Form.Label>
          <AltaQuickChips options={ESPECIALIDADES_SUGERIDAS} onPick={setEspecialidad} />
        </>
      )}
      {step === 3 && (
        <dl className="rev-alta-resumen mb-0">
          <dt>Nombre completo</dt>
          <dd>
            {nombre} {apellido}
          </dd>
          <dt>RUT</dt>
          <dd>{rut.trim() || '—'}</dd>
          <dt>Rol</dt>
          <dd>{rolSel?.nombre ?? '—'}</dd>
          <dt>Especialidad</dt>
          <dd>{especialidad.trim() || 'Sin especificar'}</dd>
          <dt>Estado inicial</dt>
          <dd>Disponible (sin brigada asignada)</dd>
        </dl>
      )}
    </AltaWizardShell>
  );
}
