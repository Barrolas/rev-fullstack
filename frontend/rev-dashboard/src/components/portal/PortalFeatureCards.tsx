import { useState } from 'react';

type DiagramType = 'report' | 'zones' | 'coordination' | 'tracking';

interface PortalFeature {
  id: string;
  icon: string;
  title: string;
  detail: string;
  diagram: DiagramType;
}

const FEATURES: PortalFeature[] = [
  {
    id: 'report',
    icon: 'bi-broadcast-pin',
    title: 'Reporte ciudadano',
    detail: 'Alertas sin cuenta, directo al despacho.',
    diagram: 'report',
  },
  {
    id: 'zones',
    icon: 'bi-map',
    title: 'Zonas de riesgo',
    detail: 'Prioriza según mapas del valle.',
    diagram: 'zones',
  },
  {
    id: 'coordination',
    icon: 'bi-people',
    title: 'Coordinación',
    detail: 'Brigadas y vehículos en minutos.',
    diagram: 'coordination',
  },
  {
    id: 'tracking',
    icon: 'bi-shield-check',
    title: 'Seguimiento',
    detail: 'Estado trazable por la municipalidad.',
    diagram: 'tracking',
  },
];

function FeatureDiagram({ type }: { type: DiagramType }) {
  switch (type) {
    case 'report':
      return (
        <div className="rev-portal-diagram rev-portal-diagram--inline" aria-hidden="true">
          <span className="rev-portal-diagram__node">Usted</span>
          <span className="rev-portal-diagram__arrow">→</span>
          <span className="rev-portal-diagram__node rev-portal-diagram__node--accent">Despacho</span>
        </div>
      );
    case 'zones':
      return (
        <div className="rev-portal-diagram rev-portal-diagram--inline" aria-hidden="true">
          <span className="rev-portal-diagram__pill rev-portal-diagram__pill--high">Alto</span>
          <span className="rev-portal-diagram__pill">Medio</span>
          <span className="rev-portal-diagram__pill">Bajo</span>
        </div>
      );
    case 'coordination':
      return (
        <div className="rev-portal-diagram rev-portal-diagram--inline" aria-hidden="true">
          <span className="rev-portal-diagram__node rev-portal-diagram__node--accent">Despacho</span>
          <span className="rev-portal-diagram__arrow">→</span>
          <span className="rev-portal-diagram__node"><i className="bi bi-people" /> Brigada</span>
        </div>
      );
    case 'tracking':
      return (
        <div className="rev-portal-diagram rev-portal-diagram--inline" aria-hidden="true">
          <span className="rev-portal-diagram__pill">Reportado</span>
          <span className="rev-portal-diagram__arrow">→</span>
          <span className="rev-portal-diagram__pill rev-portal-diagram__node--accent">Controlado</span>
        </div>
      );
  }
}

export default function PortalFeatureCards() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <section className="rev-portal__features" aria-labelledby="portal-features-title">
      <header className="rev-portal__section-head rev-portal__section-head--compact">
        <h2 id="portal-features-title" className="rev-portal__section-title">
          ¿Qué hace REV?
        </h2>
        <p className="rev-portal__section-desc">Toque para ampliar</p>
      </header>

      <ul className="rev-portal__feature-grid">
        {FEATURES.map(({ id, icon, title, detail, diagram }) => {
          const isOpen = expandedId === id;
          return (
            <li key={id}>
              <button
                type="button"
                className={`rev-portal__feature-card${isOpen ? ' rev-portal__feature-card--open' : ''}`}
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
                aria-controls={`portal-feature-${id}`}
              >
                <span className="rev-portal__feature-head">
                  <span className="rev-portal__feature-icon" aria-hidden="true">
                    <i className={`bi ${icon}`} />
                  </span>
                  <span className="rev-portal__feature-title">{title}</span>
                  <i
                    className={`bi bi-plus-lg rev-portal__feature-toggle${isOpen ? ' rev-portal__feature-toggle--open' : ''}`}
                    aria-hidden="true"
                  />
                </span>

                <div
                  id={`portal-feature-${id}`}
                  className="rev-portal__feature-detail"
                  role="region"
                  aria-hidden={!isOpen}
                >
                  <p className="rev-portal__feature-detail-text">{detail}</p>
                  <FeatureDiagram type={diagram} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
