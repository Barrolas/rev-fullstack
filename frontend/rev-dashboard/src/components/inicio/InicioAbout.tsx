import { Link } from 'react-router-dom';
import { REV_BRAND, REV_IMAGES } from '../../branding';
import RevLogo from '../branding/RevLogo';

const PILLARS = [
  {
    id: 'dispatch',
    tag: 'Despacho',
    icon: 'bi-broadcast-pin',
    title: 'Despacho unificado',
    desc: 'Todo lo que ocurre en la comuna, en una sola pantalla para decidir con rapidez.',
    points: [
      'Resumen claro de emergencias activas',
      'Priorización según urgencia y zona',
      'Coordinación de brigadas y vehículos',
    ],
    image: REV_IMAGES.aboutDispatch,
    to: '/',
    cta: 'Ir al despacho',
  },
  {
    id: 'map',
    tag: 'Territorio',
    icon: 'bi-map',
    title: 'Mapa de zonas',
    desc: 'Conozca el riesgo del lugar antes de enviar equipos a terreno.',
    points: [
      'Zonas sensibles visibles en el mapa',
      'Ubicación de cada reporte en el valle',
      'Menos errores al asignar recursos',
    ],
    image: REV_IMAGES.aboutMap,
    to: '/zonas',
    cta: 'Explorar mapa',
  },
  {
    id: 'portal',
    tag: 'Comunidad',
    icon: 'bi-people',
    title: 'Portal ciudadano',
    desc: 'Los vecinos reportan emergencias sin trámites; usted recibe el aviso al instante.',
    points: [
      'Reporte simple, sin crear cuenta',
      'Llegada directa al despacho municipal',
      'Más ojos alerta en todo el territorio',
    ],
    image: REV_IMAGES.aboutPortal,
    to: '/portal',
    cta: 'Ver portal',
  },
] as const;

const PROMISES = [
  {
    icon: 'bi-geo-alt',
    title: 'Cobertura municipal',
    text: 'Valle del Sol conectado de punta a punta',
  },
  {
    icon: 'bi-clock-history',
    title: 'Respuesta oportuna',
    text: 'Información actualizada para actuar a tiempo',
  },
  {
    icon: 'bi-heart-pulse',
    title: 'Misión crítica',
    text: 'Proteger vidas y bienes de la comunidad',
  },
] as const;

export default function InicioAbout() {
  return (
    <section className="rev-inicio__showcase rev-card" aria-label="Red de Emergencia Valle">
      <header className="rev-inicio__showcase-intro">
        <div className="rev-inicio__showcase-intro-row">
          <div className="rev-inicio__showcase-logo-wrap">
            <RevLogo variant="emblemColor" size={40} className="rev-inicio__showcase-logo" />
          </div>
          <div className="rev-inicio__showcase-intro-copy">
            <p className="rev-inicio__showcase-eyebrow">{REV_BRAND.municipality}</p>
            <h2 className="rev-inicio__showcase-title">{REV_BRAND.name}</h2>
            <p className="rev-inicio__showcase-tagline">{REV_BRAND.tagline}</p>
            <p className="rev-inicio__showcase-lead">
              REV une al despacho municipal, las brigadas en terreno y la ciudadanía en una red de
              respuesta ante emergencias. Un solo lugar para ver, priorizar y coordinar la ayuda
              cuando más se necesita.
            </p>
          </div>
        </div>
      </header>

      <ul className="rev-inicio__showcase-promises" aria-label="Compromiso REV">
        {PROMISES.map(({ icon, title, text }) => (
          <li key={title} className="rev-inicio__showcase-promise">
            <span className="rev-inicio__showcase-promise-icon" aria-hidden="true">
              <i className={`bi ${icon}`} />
            </span>
            <div className="rev-inicio__showcase-promise-copy">
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="rev-inicio__showcase-body">
        <header className="rev-inicio__showcase-body-head">
          <div>
            <p className="rev-inicio__showcase-body-eyebrow">Cómo le ayuda REV</p>
            <h3 className="rev-inicio__showcase-body-title">Su red de respuesta</h3>
          </div>
          <p className="rev-inicio__showcase-body-desc">
            Tres frentes conectados para proteger el valle
          </p>
        </header>

        <div className="rev-inicio__showcase-cards">
          {PILLARS.map(({ id, tag, icon, title, desc, points, image, to, cta }) => (
            <Link key={id} to={to} className="rev-inicio__showcase-card">
              <figure className="rev-inicio__showcase-card-banner">
                <img src={image} alt="" className="rev-inicio__showcase-card-img" loading="lazy" />
                <span className="rev-inicio__showcase-card-shade" aria-hidden="true" />
                <figcaption className="rev-inicio__showcase-card-tag">
                  <i className={`bi ${icon}`} aria-hidden="true" />
                  {tag}
                </figcaption>
              </figure>
              <div className="rev-inicio__showcase-card-body">
                <h4 className="rev-inicio__showcase-card-title">{title}</h4>
                <p className="rev-inicio__showcase-card-desc">{desc}</p>
                <ul className="rev-inicio__showcase-card-list">
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <span className="rev-inicio__showcase-card-cta">
                  {cta}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="rev-inicio__showcase-foot">
        <i className="bi bi-shield-check" aria-hidden="true" />
        <span>{REV_BRAND.municipality} · Protección municipal coordinada</span>
      </footer>
    </section>
  );
}
