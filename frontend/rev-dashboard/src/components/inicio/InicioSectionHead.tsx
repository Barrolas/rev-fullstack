import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface InicioSectionHeadProps {
  eyebrow?: string;
  title: string;
  desc?: string;
  linkTo?: string;
  linkLabel?: string;
  compact?: boolean;
  action?: ReactNode;
}

export default function InicioSectionHead({
  eyebrow,
  title,
  desc,
  linkTo,
  linkLabel,
  compact,
  action,
}: InicioSectionHeadProps) {
  return (
    <header
      className={`rev-inicio__head${compact ? ' rev-inicio__head--compact' : ''}`}
    >
      <div className="rev-inicio__head-copy">
        {eyebrow && <p className="rev-inicio__eyebrow">{eyebrow}</p>}
        <h2 className="rev-inicio__head-title">{title}</h2>
        {desc && <p className="rev-inicio__head-desc">{desc}</p>}
      </div>
      {action}
      {linkTo && linkLabel && (
        <Link to={linkTo} className="rev-inicio__head-link">
          {linkLabel}
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      )}
    </header>
  );
}
