import { FormEvent, ReactNode } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RevModal from '../../primitives/RevModal';

interface AltaWizardShellProps {
  show: boolean;
  onHide: () => void;
  title: string;
  steps: readonly string[];
  step: number;
  setStep: (n: number) => void;
  saving?: boolean;
  error?: string;
  canNext: boolean;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  tip?: ReactNode;
  children: ReactNode;
  formId: string;
}

export default function AltaWizardShell({
  show,
  onHide,
  title,
  steps,
  step,
  setStep,
  saving = false,
  error,
  canNext,
  onSubmit,
  submitLabel = 'Registrar',
  tip,
  children,
  formId,
}: AltaWizardShellProps) {
  const last = steps.length - 1;
  const isReview = step === last;
  const sessionExpired = error?.includes('Sesión expirada');

  return (
    <RevModal
      show={show}
      onHide={onHide}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
          {step > 0 && (
            <Button variant="outline-primary" onClick={() => setStep(step - 1)} disabled={saving}>
              Atrás
            </Button>
          )}
          {!isReview ? (
            <Button variant="primary" disabled={!canNext || saving} onClick={() => setStep(step + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button variant="success" type="submit" form={formId} disabled={saving || !canNext}>
              {saving ? 'Guardando…' : submitLabel}
            </Button>
          )}
        </>
      }
    >
      <div className="rev-alta-wizard">
        <div className="rev-dotacion-wizard__steps mb-3">
          {steps.map((label, i) => (
            <span
              key={label}
              className={`rev-dotacion-wizard__step${i === step ? ' active' : i < step ? ' done' : ''}`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
        {error && (
          <Alert variant={sessionExpired ? 'warning' : 'danger'}>
            {error}
            {sessionExpired && (
              <div className="mt-2">
                <Link to="/login" className="btn btn-sm btn-outline-dark">
                  Ir a iniciar sesión
                </Link>
              </div>
            )}
          </Alert>
        )}
        <div className="rev-alta-wizard__body">
          <div className="rev-alta-wizard__main">
            <form id={formId} onSubmit={onSubmit}>
              {children}
            </form>
          </div>
          {tip && <aside className="rev-alta-wizard__tip">{tip}</aside>}
        </div>
      </div>
    </RevModal>
  );
}

export function AltaTipBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rev-alta-tip">
      <h4 className="rev-alta-tip__title">
        <i className="bi bi-lightbulb me-1" aria-hidden="true" />
        {title}
      </h4>
      <div className="rev-alta-tip__body">{children}</div>
    </div>
  );
}

export function AltaQuickChips({
  options,
  onPick,
}: {
  options: readonly string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="rev-alta-chips">
      {options.map((opt) => (
        <button key={opt} type="button" className="rev-alta-chips__btn" onClick={() => onPick(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}
