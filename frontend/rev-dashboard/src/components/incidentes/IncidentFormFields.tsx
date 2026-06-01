import { FormEvent, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { createIncidente, createPublicIncidente } from '../../api';

interface FormErrors {
  tipo?: string;
  descripcion?: string;
  lat?: string;
  lng?: string;
}

interface IncidentFormFieldsProps {
  onSuccess: (incidentId?: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  /** Reporte ciudadano sin autenticación */
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
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [geoLoading, setGeoLoading] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!tipo.trim()) e.tipo = 'El tipo es obligatorio';
    if (!descripcion.trim()) e.descripcion = 'La descripcion es obligatoria';
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!lat.trim() || Number.isNaN(latNum)) e.lat = 'Indique la ubicación';
    if (!lng.trim() || Number.isNaN(lngNum)) e.lng = 'Indique la ubicación';
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
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      if (publicMode) {
        const result = await createPublicIncidente(payload);
        onSuccess(result.id || undefined);
      } else {
        await createIncidente(payload);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
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
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{publicMode ? 'Ubicación norte-sur *' : 'Referencia norte-sur *'}</Form.Label>
            <Form.Control
              type="number"
              step="any"
              placeholder="-33.45"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              isInvalid={!!errors.lat}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.lat}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{publicMode ? 'Ubicación este-oeste *' : 'Referencia este-oeste *'}</Form.Label>
            <Form.Control
              type="number"
              step="any"
              placeholder="-70.66"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              isInvalid={!!errors.lng}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.lng}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Alert variant="secondary" className="small rev-alert rev-alert--info">
        {publicMode ? (
          <>
            Indique dónde ocurre la emergencia. Si puede, use el botón de ubicación para mayor
            precisión dentro del territorio municipal.
          </>
        ) : (
          <>Valle del Sol: ingrese la ubicación dentro del territorio municipal.</>
        )}
      </Alert>
      {publicMode && (
        <div className="mb-3">
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={useMyLocation}
            disabled={geoLoading || submitting}
          >
            <i className={`bi ${geoLoading ? 'bi-arrow-repeat' : 'bi-geo-alt'} me-1`} />
            {geoLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
          </Button>
        </div>
      )}
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
