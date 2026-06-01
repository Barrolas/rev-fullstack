import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getToken } from '../api';
import { REV_BRAND, REV_IMAGES } from '../branding';
import RevLogo from '../components/branding/RevLogo';
import IncidentFormFields from '../components/incidentes/IncidentFormFields';
import PortalFeatureCards from '../components/portal/PortalFeatureCards';
import PortalReportFlow from '../components/portal/PortalReportFlow';
import WeatherChip from '../components/weather/WeatherChip';

export default function PortalPage() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (getToken()) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <div className="rev-portal">
      <div className="rev-portal__ambient" aria-hidden="true">
        <span className="rev-portal__orb rev-portal__orb--1" />
        <span className="rev-portal__orb rev-portal__orb--2" />
      </div>

      <header className="rev-portal__header">
        <div className="rev-portal__header-inner">
          <RevLogo variant="horizontalColor" size="md" className="rev-portal__logo" />
          <nav className="rev-portal__nav" aria-label="Acciones del portal">
            <WeatherChip compact />
            <a href="#capacidades" className="rev-portal__nav-link">Capacidades</a>
            <a href="#proceso" className="rev-portal__nav-link">Proceso</a>
            <a href="#reportar" className="rev-portal__nav-link rev-portal__nav-link--accent">
              Reportar
            </a>
            <Link to="/login" className="rev-portal__nav-link">Despacho</Link>
          </nav>
        </div>
      </header>

      <main className="rev-portal__main">
        <section className="rev-portal__hero">
          <div className="rev-portal__hero-copy">
            <p className="rev-portal__eyebrow">{REV_BRAND.municipality}</p>
            <h1 className="rev-portal__title">{REV_BRAND.name}</h1>
            <p className="rev-portal__lead">{REV_BRAND.tagline}</p>
            <p className="rev-portal__desc">
              Reporte emergencias en el valle sin crear cuenta. Su alerta llega al despacho
              municipal y activa la respuesta coordinada de brigadas y recursos.
            </p>
            <div className="rev-portal__hero-stats">
              <span className="rev-portal__hero-stat">
                <i className="bi bi-clock" aria-hidden="true" />
                Respuesta inmediata
              </span>
              <span className="rev-portal__hero-stat">
                <i className="bi bi-shield" aria-hidden="true" />
                Sin cuenta
              </span>
            </div>
            <div className="rev-portal__hero-actions">
              <a href="#reportar" className="rev-portal__cta">
                Reportar emergencia
                <i className="bi bi-arrow-down" aria-hidden="true" />
              </a>
              <Link to="/login" className="rev-portal__cta rev-portal__cta--ghost">
                Acceso despacho
              </Link>
            </div>
          </div>
          <figure className="rev-portal__hero-media">
            <img
              src={REV_IMAGES.fieldTeam}
              alt="Brigada REV coordinando con la comunidad"
              loading="eager"
            />
            <div className="rev-portal__hero-media-badge">
              <i className="bi bi-people-fill" aria-hidden="true" />
              Protegemos el valle juntos
            </div>
          </figure>
        </section>

        <div id="capacidades">
          <PortalFeatureCards />
        </div>

        <div id="proceso">
          <PortalReportFlow />
        </div>

        <section id="reportar" className="rev-portal__report">
          <div className="rev-portal__report-shell">
            <div className="rev-portal__report-aside">
              <p className="rev-portal__section-eyebrow">Formulario</p>
              <h2 className="rev-portal__section-title">Reportar emergencia</h2>
              <p className="rev-portal__section-desc">
                Complete los datos con calma. Si puede, permanezca en un lugar seguro mientras envía el reporte.
              </p>
              <ul className="rev-portal__report-hints">
                <li><i className="bi bi-check2" /> Misma vía que atiende el despacho municipal</li>
                <li><i className="bi bi-check2" /> Ubicación opcional desde su teléfono</li>
                <li><i className="bi bi-check2" /> Tipos: forestal, urbano, estructural</li>
              </ul>
            </div>

            <div className="rev-portal__report-form-wrap">
              {submittedId ? (
                <div className="rev-portal__success" role="status">
                  <span className="rev-portal__success-icon" aria-hidden="true">
                    <i className="bi bi-check-circle" />
                  </span>
                  <div>
                    <p className="rev-portal__success-title">Reporte enviado correctamente</p>
                    <p className="rev-portal__success-text">
                      Su alerta fue registrada. El despacho REV la procesará a la brevedad.
                      {submittedId !== 'ok' && (
                        <>
                          {' '}Referencia: <code>{submittedId.slice(0, 8)}…</code>
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rev-portal__cta rev-portal__cta--ghost"
                    onClick={() => setSubmittedId(null)}
                  >
                    Enviar otro reporte
                  </button>
                </div>
              ) : (
                <IncidentFormFields
                  publicMode
                  submitLabel="Enviar reporte"
                  className="rev-portal__form"
                  onSuccess={(id) => setSubmittedId(id ?? 'ok')}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="rev-portal__footer">
        <span>{REV_BRAND.name}</span>
        <span aria-hidden="true">·</span>
        <span>{REV_BRAND.municipality}</span>
        <span aria-hidden="true">·</span>
        <Link to="/login">Acceso despacho</Link>
      </footer>
    </div>
  );
}
