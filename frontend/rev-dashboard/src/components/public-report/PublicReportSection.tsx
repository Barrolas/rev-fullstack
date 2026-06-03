import type { ReactNode } from 'react';

interface PublicReportSectionProps {
  step: number;
  icon: string;
  title: string;
  hint?: string;
  optional?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function PublicReportSection({
  step,
  icon,
  title,
  hint,
  optional = false,
  collapsible = false,
  defaultOpen = true,
  children,
}: PublicReportSectionProps) {
  if (collapsible) {
    return (
      <details className="rev-public-section rev-public-section--fold" open={defaultOpen}>
        <summary className="rev-public-section__head">
          <span className="rev-public-section__step" aria-hidden="true">
            {step}
          </span>
          <span className="rev-public-section__icon" aria-hidden="true">
            <i className={`bi ${icon}`} />
          </span>
          <span className="rev-public-section__titles">
            <span className="rev-public-section__title">{title}</span>
            {hint && <span className="rev-public-section__hint">{hint}</span>}
          </span>
          {optional && <span className="rev-public-section__badge">Opcional</span>}
          <i className="bi bi-chevron-down rev-public-section__chevron" aria-hidden="true" />
        </summary>
        <div className="rev-public-section__body">{children}</div>
      </details>
    );
  }

  return (
    <section className="rev-public-section" aria-labelledby={`public-section-${step}`}>
      <header className="rev-public-section__head rev-public-section__head--static" id={`public-section-${step}`}>
        <span className="rev-public-section__step" aria-hidden="true">
          {step}
        </span>
        <span className="rev-public-section__icon" aria-hidden="true">
          <i className={`bi ${icon}`} />
        </span>
        <span className="rev-public-section__titles">
          <span className="rev-public-section__title">{title}</span>
          {hint && <span className="rev-public-section__hint">{hint}</span>}
        </span>
        {optional && <span className="rev-public-section__badge">Opcional</span>}
      </header>
      <div className="rev-public-section__body">{children}</div>
    </section>
  );
}
