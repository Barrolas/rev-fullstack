import { FormEvent, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { createIncidente, createPublicIncidente } from '../../api';
import IncidentLocationPicker, { LocationValue } from '../public-report/IncidentLocationPicker';

interface FormErrors {
  tipo?: string;
  descripcion?: string;
  ubicacion?: string;
}

interface IncidentFormFieldsProps {
  onSuccess: (incidentId?: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  /** Reporte ciudadano sin autenticaci?n */
  publicMode?: boolean;
  className?: string;
}

export default function IncidentFormFields({
  onSuccess,
  onCancel,
  submitLabel = 'Registrar incidente',
  publicMode = false,
  className = '',
}: IncidentFormFieldsProps) {
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [location, setLocation] = useState<LocationValue>({
    lat: null,
    lng: null,
    direccionReferencia: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasLocation = useMemo(() => {
    const hasCoords = location.lat != null && location.lng != null;
    return hasCoords || location.direccionReferencia.trim().length > 0;
  }, [location]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!tipo.trim()) e.tipo = 'El tipo es obligatorio';
    if (!descripcion.trim()) e.descripcion = 'La descripcion es obligatoria';
    if (!hasLocation) {
      e.ubicacion = 'Indique ubicacion en el mapa, busque una direccion o use su ubicacion';
    } else if (location.lat == null || location.lng == null) {
      e.ubicacion = 'Marque el punto en el mapa o seleccione un resultado de busqueda';
    }
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        tipo: tipo.trim(),
        descripcion: descripcion.trim(),
        lat: location.lat!,
        lng: location.lng!,
        direccionReferencia: location.direccionReferencia.trim() || undefined,
      };
      if (publicMode) {
        const result = await createPublicIncidente(payload);
        onSuccess(result.id || undefined);
      } else {
        await createIncidente(payload);
        onSuccess();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar';
      setError(
        msg.includes('Sesión expirada')
          ? `${msg} Será redirigido al inicio de sesión.`
          : msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} noValidate className={className}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo *</Form.Label>
            <Form.Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              isInvalid={!!errors.tipo}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="FORESTAL">Forestal</option>
              <option value="URBANO">Urbano</option>
              <option value="ESTRUCTURAL">Estructural</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.tipo}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Descripcion *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          isInvalid={!!errors.descripcion}
          required
        />
        <Form.Control.Feedback type="invalid">{errors.descripcion}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt" aria-hidden="true" />
          Ubicacion del incidente *
        </Form.Label>
        <IncidentLocationPicker
          value={location}
          onChange={setLocation}
          disabled={submitting}
        />
        {errors.ubicacion && (
          <div className="invalid-feedback d-block">{errors.ubicacion}</div>
        )}
      </Form.Group>

      <Alert variant="secondary" className="small rev-alert rev-alert--info">
        {publicMode ? (
          <>
            Indique donde ocurre la emergencia. Use el mapa, la busqueda de direccion o su
            ubicacion actual para mayor precision dentro del territorio municipal.
          </>
        ) : (
          <>
            Valle del Sol: marque el punto en el mapa, busque la direccion o use su ubicacion.
            Las coordenadas se registran para despacho y evaluacion de riesgo territorial.
          </>
        )}
      </Alert>

      {error && <Alert variant="danger" className="rev-alert rev-alert--error">{error}</Alert>}
      <div className="d-flex gap-2 justify-content-end">
        {onCancel && (
          <Button variant="outline-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="danger" disabled={submitting}>
          {submitting ? 'Registrando...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
