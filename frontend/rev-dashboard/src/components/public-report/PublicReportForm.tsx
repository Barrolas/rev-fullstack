import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { submitPublicReport, PublicReportPayload, PublicReportResult } from '../../api';
import IncidentLocationPicker, { LocationValue } from './IncidentLocationPicker';
import IncidentMediaCapture, { MediaCaptureValue } from './IncidentMediaCapture';
import PublicReportSection from './PublicReportSection';
import ReporterIdentitySection, { ReporterIdentityValue } from './ReporterIdentitySection';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface PublicReportFormProps {
  onSuccess: (result: PublicReportResult) => void;
  onGoToLogin?: () => void;
}

export default function PublicReportForm({ onSuccess, onGoToLogin }: PublicReportFormProps) {
  const formLoadedAt = useRef(Date.now());
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [location, setLocation] = useState<LocationValue>({
    lat: null,
    lng: null,
    direccionReferencia: '',
  });
  const [media, setMedia] = useState<MediaCaptureValue>({ fotos: [], video: null });
  const [identity, setIdentity] = useState<ReporterIdentityValue>({
    anonimo: true,
    nombre: '',
    apellido: '',
    rut: '',
    contacto: '',
    registrarme: false,
    registroUsername: '',
    registroPassword: '',
    registroEmail: '',
  });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<PublicReportResult | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY === 'disabled') return;

    const renderWidget = () => {
      if (!turnstileRef.current || !window.turnstile || turnstileWidgetId.current) return;
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setCaptchaToken(token),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const hasValidLocation = useMemo(() => {
    const hasCoords = location.lat != null && location.lng != null;
    return hasCoords || location.direccionReferencia.trim().length > 0;
  }, [location]);

  const missingForSubmit = useMemo(() => {
    const missing: string[] = [];
    if (!tipo.trim()) missing.push('tipo');
    if (!descripcion.trim()) missing.push('descripción');
    if (!hasValidLocation) missing.push('ubicación');
    if (!identity.anonimo && identity.registrarme) {
      if (!identity.registroUsername.trim() || !identity.registroPassword.trim()) {
        missing.push('usuario y clave');
      }
    }
    return missing;
  }, [tipo, descripcion, hasValidLocation, identity]);

  const canSubmit = consent;

  const submitDisabledReason = useMemo(() => {
    if (submitting) return null;
    if (!consent) return 'Debe autorizar el tratamiento de datos para enviar el reporte.';
    if (missingForSubmit.length > 0) {
      return `Complete: ${missingForSubmit.join(', ')}.`;
    }
    return null;
  }, [submitting, consent, missingForSubmit]);

  const validate = (): string | null => {
    if (!tipo.trim()) return 'Seleccione el tipo de emergencia.';
    if (!descripcion.trim()) return 'Describa la situación.';
    const hasCoords = location.lat != null && location.lng != null;
    if (!hasCoords && !location.direccionReferencia.trim()) {
      return 'Indique ubicación en el mapa, con GPS o escriba una referencia.';
    }
    if (!consent) return 'Debe aceptar el tratamiento de datos para enviar el reporte.';
    if (!identity.anonimo && identity.registrarme) {
      if (!identity.registroUsername.trim() || !identity.registroPassword.trim()) {
        return 'Complete usuario y clave para registrarse.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    const payload: PublicReportPayload = {
      tipo: tipo.trim(),
      descripcion: descripcion.trim(),
      lat: location.lat ?? undefined,
      lng: location.lng ?? undefined,
      direccionReferencia: location.direccionReferencia.trim() || undefined,
      anonimo: identity.anonimo,
      reportanteNombre: identity.anonimo ? undefined : identity.nombre.trim() || undefined,
      reportanteApellido: identity.anonimo ? undefined : identity.apellido.trim() || undefined,
      reportanteRut: identity.anonimo ? undefined : identity.rut.trim() || undefined,
      reportanteContacto: identity.anonimo ? undefined : identity.contacto.trim() || undefined,
      registrarme: !identity.anonimo && identity.registrarme,
      registroUsername: identity.registrarme ? identity.registroUsername.trim() : undefined,
      registroPassword: identity.registrarme ? identity.registroPassword : undefined,
      registroEmail: identity.registrarme ? identity.registroEmail.trim() || undefined : undefined,
    };

    try {
      const result = await submitPublicReport({
        payload,
        fotos: media.fotos,
        video: media.video,
        honeypot,
        formLoadedAt: formLoadedAt.current,
        captchaToken: captchaToken || undefined,
      });
      setSuccess(result);
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el reporte.');
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current);
        setCaptchaToken('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTipo('');
    setDescripcion('');
    setLocation({ lat: null, lng: null, direccionReferencia: '' });
    setMedia({ fotos: [], video: null });
    setIdentity({
      anonimo: true,
      nombre: '',
      apellido: '',
      rut: '',
      contacto: '',
      registrarme: false,
      registroUsername: '',
      registroPassword: '',
      registroEmail: '',
    });
    setConsent(false);
    setError('');
    setSuccess(null);
    formLoadedAt.current = Date.now();
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
      setCaptchaToken('');
    }
  };

  if (success) {
    return (
      <div className="rev-public-success" role="status">
        <div className="rev-public-success__icon" aria-hidden="true">
          <i className="bi bi-check-circle-fill" />
        </div>
        <h2 className="rev-public-success__title">Reporte recibido</h2>
        <p className="rev-public-success__text">{success.mensaje}</p>
        {success.folio && (
          <p className="rev-public-success__folio">
            Folio: <strong>{success.folio}</strong>
          </p>
        )}
        <p className="rev-public-success__note">
          Conserve su folio. Si la situación es de riesgo vital, llame al <strong>132</strong>.
        </p>
        <div className="rev-public-success__actions">
          <button type="button" className="rev-login__submit" onClick={resetForm}>
            Reportar otro
          </button>
          {onGoToLogin && (
            <button type="button" className="rev-public-success__secondary" onClick={onGoToLogin}>
              Ingresar al sistema
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className="rev-public-form" onSubmit={handleSubmit} noValidate>
      <div className="rev-public-form__banner" role="note">
        <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
        <span>
          Si hay riesgo vital, llame al <strong>132</strong> antes de completar este formulario.
        </span>
      </div>

      <PublicReportSection step={1} icon="bi-fire" title="Situación" hint="Tipo y descripción del hecho">
        <div className="rev-public-form__grid-2">
          <div className="rev-public-form__field">
            <label className="rev-field__label" htmlFor="public-tipo">
              Tipo de emergencia *
            </label>
            <select
              id="public-tipo"
              className="rev-public-form__select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              disabled={submitting}
              required
            >
              <option value="">Seleccionar…</option>
              <option value="FORESTAL">Forestal / vegetación</option>
              <option value="URBANO">Urbano / basura / pastizal</option>
              <option value="ESTRUCTURAL">Estructural / vivienda</option>
            </select>
          </div>
          <div className="rev-public-form__field">
            <label className="rev-field__label" htmlFor="public-descripcion">
              Descripción *
            </label>
            <textarea
              id="public-descripcion"
              className="rev-public-form__textarea"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={submitting}
              placeholder="Humo, fuego visible, personas en riesgo…"
              required
            />
          </div>
        </div>
      </PublicReportSection>

      <PublicReportSection
        step={2}
        icon="bi-geo-alt"
        title="Ubicación"
        hint="Mapa, GPS o referencia escrita"
      >
        <IncidentLocationPicker value={location} onChange={setLocation} disabled={submitting} />
      </PublicReportSection>

      <PublicReportSection
        step={3}
        icon="bi-camera"
        title="Evidencia"
        hint="Fotos o video del lugar"
        optional
        collapsible
        defaultOpen={media.fotos.length > 0 || media.video != null}
      >
        <IncidentMediaCapture value={media} onChange={setMedia} disabled={submitting} />
      </PublicReportSection>

      <PublicReportSection
        step={4}
        icon="bi-person"
        title="Identidad"
        hint="Anónimo o con datos de contacto"
        optional
        collapsible
        defaultOpen={!identity.anonimo}
      >
        <ReporterIdentitySection value={identity} onChange={setIdentity} disabled={submitting} />
      </PublicReportSection>

      <div className="rev-public-form__footer">
        <label className="rev-public-form__consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setError('');
            }}
            disabled={submitting}
            required
            aria-required="true"
          />
          <span>
            Autorizo el tratamiento de los datos de este reporte para coordinar la respuesta municipal.{' '}
            <strong>(obligatorio)</strong>
          </span>
        </label>

        {!consent && !submitting && (
          <p className="rev-public-form__hint" id="consent-hint">
            Marque la casilla para habilitar el envío.
          </p>
        )}
        {consent && missingForSubmit.length > 0 && !submitting && (
          <p className="rev-public-form__hint rev-public-form__hint--warn" id="form-pending-hint" role="status">
            <i className="bi bi-info-circle me-1" aria-hidden="true" />
            Falta: {missingForSubmit.join(', ')}.
          </p>
        )}

        {TURNSTILE_SITE_KEY && TURNSTILE_SITE_KEY !== 'disabled' && <div ref={turnstileRef} />}

        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="rev-public-honeypot"
        />

        {error && (
          <div className="rev-login__error" role="alert">
            <i className="bi bi-exclamation-circle" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="rev-login__submit"
          disabled={submitting || !canSubmit}
          title={submitDisabledReason ?? undefined}
          aria-describedby={
            !consent ? 'consent-hint' : missingForSubmit.length > 0 ? 'form-pending-hint' : undefined
          }
        >
          {submitting ? (
            <>
              <span className="rev-login__spinner" aria-hidden="true" />
              Enviando reporte…
            </>
          ) : (
            <>
              Enviar reporte de emergencia
              <i className="bi bi-send" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
