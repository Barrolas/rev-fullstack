import { FormEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { createVehiculo } from '../../../api';
import { VEHICULO_TIPOS, vehiculoTipoPreset } from '../../../utils/recursosAltaConfig';
import AltaWizardShell, { AltaTipBox } from './AltaWizardShell';

const STEPS = ['Tipo y patente', 'Ficha técnica', 'Capacidades', 'Confirmar'] as const;
const FORM_ID = 'alta-vehiculo-form';

interface AltaVehiculoWizardProps {
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
  onAltaError?: (message: string) => void;
}

export default function AltaVehiculoWizard({ show, onHide, onSaved, onAltaError }: AltaVehiculoWizardProps) {
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState('CAMIONETA');
  const [patente, setPatente] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [pasajeros, setPasajeros] = useState('5');
  const [carga, setCarga] = useState('500');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) {
      setStep(0);
      setTipo('CAMIONETA');
      setPatente('');
      setMarca('');
      setModelo('');
      setAnio('');
      setPasajeros('5');
      setCarga('500');
      setError('');
    }
  }, [show]);

  const pickTipo = (id: string) => {
    setTipo(id);
    const preset = vehiculoTipoPreset(id);
    setPasajeros(String(preset.pasajeros));
    setCarga(String(preset.carga));
  };

  const canNext =
    (step === 0 && patente.trim().length >= 4) ||
    step === 1 ||
    (step === 2 && Number(pasajeros) > 0) ||
    step === 3;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createVehiculo({
        patente: patente.trim(),
        tipo,
        marca: marca.trim() || undefined,
        modelo: modelo.trim() || undefined,
        anio: anio ? Number(anio) : undefined,
        capacidadPasajeros: Number(pasajeros),
        capacidadCarga: Number(carga) || 0,
      });
      onSaved();
      onHide();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar vehículo';
      setError(msg);
      onAltaError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  const tipoLabel = vehiculoTipoPreset(tipo).label;

  return (
    <AltaWizardShell
      show={show}
      onHide={onHide}
      title="Agregar vehículo"
      steps={STEPS}
      step={step}
      setStep={setStep}
      saving={saving}
      error={error}
      canNext={Boolean(canNext)}
      onSubmit={handleSubmit}
      submitLabel="Registrar vehículo"
      formId={FORM_ID}
      tip={
        <AltaTipBox title="Capacidad operativa">
          <p className="small mb-2">
            La <strong>capacidad de pasajeros</strong> del vehículo principal limita cuántos
            integrantes pueden salir en despacho, aunque la brigada tenga cupo mayor.
          </p>
          <p className="small mb-0">
            Al elegir un tipo se sugieren valores típicos; ajústelos según la ficha real del
            vehículo municipal.
          </p>
        </AltaTipBox>
      }
    >
      {step === 0 && (
        <>
          <Form.Label className="mb-2">Tipo de vehículo</Form.Label>
          <div className="rev-alta-tipo-grid mb-3">
            {VEHICULO_TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`rev-alta-tipo-card${tipo === t.id ? ' rev-alta-tipo-card--active' : ''}`}
                onClick={() => pickTipo(t.id)}
              >
                <i className={`bi ${t.icon} rev-alta-tipo-card__icon`} aria-hidden="true" />
                <span className="rev-alta-tipo-card__label">{t.label}</span>
                <span className="rev-alta-tipo-card__desc">{t.desc}</span>
              </button>
            ))}
          </div>
          <Form.Group className="mb-0">
            <Form.Label>Patente</Form.Label>
            <Form.Control
              placeholder="REV-1001"
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
              required
            />
            <Form.Text>Mínimo 4 caracteres; se guarda en mayúsculas.</Form.Text>
          </Form.Group>
        </>
      )}
      {step === 1 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control placeholder="Toyota, Mercedes…" value={marca} onChange={(e) => setMarca(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control placeholder="Hilux, Sprinter…" value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Año (opcional)</Form.Label>
            <Form.Control
              type="number"
              min={1980}
              max={2100}
              placeholder="2022"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </Form.Group>
        </>
      )}
      {step === 2 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Capacidad de pasajeros</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={60}
              value={pasajeros}
              onChange={(e) => setPasajeros(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Capacidad de carga (kg)</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={carga}
              onChange={(e) => setCarga(e.target.value)}
            />
          </Form.Group>
        </>
      )}
      {step === 3 && (
        <dl className="rev-alta-resumen mb-0">
          <dt>Patente</dt>
          <dd>{patente.toUpperCase()}</dd>
          <dt>Tipo</dt>
          <dd>{tipoLabel}</dd>
          <dt>Marca / modelo</dt>
          <dd>
            {[marca, modelo].filter(Boolean).join(' ') || '—'}
            {anio ? ` (${anio})` : ''}
          </dd>
          <dt>Pasajeros / carga</dt>
          <dd>
            {pasajeros} plazas · {carga} kg
          </dd>
        </dl>
      )}
    </AltaWizardShell>
  );
}
