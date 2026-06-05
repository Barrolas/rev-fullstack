import { FormEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { createHerramienta } from '../../../api';
import { HERRAMIENTAS_SUGERIDAS } from '../../../utils/recursosAltaConfig';
import AltaWizardShell, { AltaTipBox } from './AltaWizardShell';

const STEPS = ['Identificación', 'Ficha técnica', 'Inventario', 'Confirmar'] as const;
const FORM_ID = 'alta-herramienta-form';

interface AltaHerramientaWizardProps {
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
  onAltaError?: (message: string) => void;
}

export default function AltaHerramientaWizard({ show, onHide, onSaved, onAltaError }: AltaHerramientaWizardProps) {
  const [step, setStep] = useState(0);
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [estado, setEstado] = useState('ACTIVA');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) {
      setStep(0);
      setNombre('');
      setSku('');
      setMarca('');
      setModelo('');
      setCantidad('1');
      setEstado('ACTIVA');
      setError('');
    }
  }, [show]);

  const canNext =
    (step === 0 && nombre.trim()) ||
    step === 1 ||
    (step === 2 && Number(cantidad) > 0) ||
    step === 3;

  const pickSugerida = (item: (typeof HERRAMIENTAS_SUGERIDAS)[number]) => {
    setNombre(item.nombre);
    setCantidad(String(item.stockSugerido));
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createHerramienta({
        nombre: nombre.trim(),
        cantidadTotal: Number(cantidad),
        sku: sku.trim() || undefined,
        marca: marca.trim() || undefined,
        modelo: modelo.trim() || undefined,
        estado,
      });
      onSaved();
      onHide();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar herramienta';
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
      title="Agregar herramienta / stock"
      steps={STEPS}
      step={step}
      setStep={setStep}
      saving={saving}
      error={error}
      canNext={Boolean(canNext)}
      onSubmit={handleSubmit}
      submitLabel="Agregar al inventario"
      formId={FORM_ID}
      tip={
        <AltaTipBox title="Kit operativo">
          <p className="small mb-2">
            Use <strong>SKU</strong> para trazabilidad de bodega. El stock queda disponible para
            dotación de brigadas.
          </p>
          <p className="small mb-0">
            Gateway dev: <code>localhost:18080</code> · credenciales <code>admin</code> /{' '}
            <code>rev123</code>.
          </p>
        </AltaTipBox>
      }
    >
      {step === 0 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del artículo</Form.Label>
            <Form.Control
              placeholder="Ej. Manguera forestal 25 mm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>SKU / código interno</Form.Label>
            <Form.Control
              placeholder="MAN-FOREST-25"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
            />
          </Form.Group>
          <Form.Label className="small text-muted">Plantillas frecuentes</Form.Label>
          <div className="rev-alta-sugeridas">
            {HERRAMIENTAS_SUGERIDAS.map((item) => (
              <button
                key={item.nombre}
                type="button"
                className="rev-alta-sugeridas__item"
                onClick={() => pickSugerida(item)}
              >
                <span className="rev-alta-sugeridas__name">{item.nombre}</span>
                <span className="rev-alta-sugeridas__meta">Sugerido: {item.stockSugerido} u.</span>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              placeholder="Fabricante o proveedor"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Modelo / referencia</Form.Label>
            <Form.Control
              placeholder="Modelo comercial o especificación"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
          </Form.Group>
        </>
      )}
      {step === 2 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad total en inventario</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Estado del artículo</Form.Label>
            <div className="rev-alta-tipo-grid">
              {(['ACTIVA', 'INACTIVA'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`rev-alta-tipo-card${estado === opt ? ' rev-alta-tipo-card--active' : ''}`}
                  onClick={() => setEstado(opt)}
                >
                  <span className="rev-alta-tipo-card__label">{opt === 'ACTIVA' ? 'Activa' : 'Inactiva'}</span>
                  <span className="rev-alta-tipo-card__desc">
                    {opt === 'ACTIVA'
                      ? 'Disponible para dotación y despacho.'
                      : 'Fuera de circulación operativa.'}
                  </span>
                </button>
              ))}
            </div>
          </Form.Group>
        </>
      )}
      {step === 3 && (
        <dl className="rev-alta-resumen mb-0">
          <dt>Artículo</dt>
          <dd>{nombre}</dd>
          <dt>SKU</dt>
          <dd>{sku.trim() || '—'}</dd>
          <dt>Marca / modelo</dt>
          <dd>
            {[marca, modelo].filter(Boolean).join(' · ') || '—'}
          </dd>
          <dt>Stock inicial</dt>
          <dd>{cantidad} unidades (todas disponibles)</dd>
          <dt>Estado</dt>
          <dd>{estado === 'ACTIVA' ? 'Activa' : 'Inactiva'}</dd>
        </dl>
      )}
    </AltaWizardShell>
  );
}
