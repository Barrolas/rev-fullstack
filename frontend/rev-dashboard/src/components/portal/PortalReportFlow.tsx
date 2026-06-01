import type { CSSProperties } from 'react';
import { REV_IMAGES } from '../../branding';

const FLOW_STEPS = [
  {
    num: '01',
    icon: 'bi-pencil-square',
    title: 'Describa la emergencia',
    text: 'Seleccione tipo y describa qué ocurre.',
  },
  {
    num: '02',
    icon: 'bi-geo-alt',
    title: 'Indique la ubicación',
    text: 'Use su ubicación actual o indique el lugar en el mapa.',
  },
  {
    num: '03',
    icon: 'bi-send',
    title: 'Envíe el reporte',
    text: 'Su alerta llega directamente al despacho municipal.',
  },
  {
    num: '04',
    icon: 'bi-headset',
    title: 'Despacho activa respuesta',
    text: 'Operador asigna brigadas y da seguimiento.',
  },
] as const;

export default function PortalReportFlow() {
  return (
    <section className="rev-portal-flow" aria-labelledby="portal-flow-title">
      <div className="rev-portal-flow__shell">
        <div className="rev-portal-flow__intro">
          <p className="rev-portal__section-eyebrow">Proceso</p>
          <h2 id="portal-flow-title" className="rev-portal__section-title">
            Cómo funciona el reporte
          </h2>
          <p className="rev-portal__section-desc rev-portal-flow__lead">
            Cuatro pasos desde su alerta hasta la coordinación en terreno. Sin registro previo.
          </p>

          <figure className="rev-portal-flow__device">
            <img
              src={REV_IMAGES.deviceField}
              alt="Dispositivo REV en espacio público del valle"
              loading="lazy"
            />
            <figcaption>
              REV también opera con infraestructura física en espacios públicos del municipio.
            </figcaption>
          </figure>
        </div>

        <div className="rev-portal-flow__timeline">
          <div className="rev-portal-flow__track" aria-hidden="true">
            <span className="rev-portal-flow__track-fill" />
          </div>

          <ol className="rev-portal-flow__steps">
            {FLOW_STEPS.map(({ num, icon, title, text }, index) => (
              <li
                key={num}
                className="rev-portal-flow__step"
                style={{ '--step-index': index } as CSSProperties}
              >
                <div className="rev-portal-flow__step-marker">
                  <span className="rev-portal-flow__step-icon" aria-hidden="true">
                    <i className={`bi ${icon}`} />
                  </span>
                </div>
                <div className="rev-portal-flow__step-body">
                  <div className="rev-portal-flow__step-head">
                    <span className="rev-portal-flow__step-num">{num}</span>
                    <h3 className="rev-portal-flow__step-title">{title}</h3>
                  </div>
                  <p className="rev-portal-flow__step-text">{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rev-portal-flow__diagram" role="img" aria-label="Resumen del flujo de reporte">
            <div className="rev-portal-flow__diagram-row">
              <span className="rev-portal-flow__diagram-node">Usted</span>
              <span className="rev-portal-flow__diagram-connector" />
              <span className="rev-portal-flow__diagram-node rev-portal-flow__diagram-node--accent">REV</span>
              <span className="rev-portal-flow__diagram-connector" />
              <span className="rev-portal-flow__diagram-node">Despacho</span>
              <span className="rev-portal-flow__diagram-connector" />
              <span className="rev-portal-flow__diagram-node">Terreno</span>
            </div>
            <p className="rev-portal-flow__diagram-caption">
              Su reporte inicia la cadena de respuesta municipal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
