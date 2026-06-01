import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { REV_BRAND, REV_IMAGES } from '../branding';
import RevLogo from '../components/branding/RevLogo';
import PublicReportForm from '../components/public-report/PublicReportForm';

type LoginTab = 'ingresar' | 'reportar';

const DEV_USERS = [
  { user: 'despachador', role: 'Despachador' },
  { user: 'brigadista', role: 'Brigadista' },
  { user: 'admin', role: 'Admin' },
] as const;

const DEV_PASSWORD = 'rev123';

const LOGIN_FEATURES = [
  {
    id: 'response',
    icon: 'bi-eye',
    title: 'Situación clara al instante',
    description:
      'Vea qué emergencias están activas y cómo avanzan, sin tener que reunir datos de distintos lugares. Así puede orientar la ayuda con mayor seguridad.',
  },
  {
    id: 'territory',
    icon: 'bi-pin-map',
    title: 'El valle, bien ubicado',
    description:
      'Consulte incidentes y zonas sensibles sobre el mapa municipal. Llegar al lugar correcto a tiempo protege vidas y bienes de la comunidad.',
  },
  {
    id: 'coordination',
    icon: 'bi-people',
    title: 'Equipos mejor coordinados',
    description:
      'Brigadas, vehículos y herramientas visibles desde el despacho. Menos idas y vueltas, más foco en atender a quien lo necesita.',
  },
] as const;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>('ingresar');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [showDevHint, setShowDevHint] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleFeature = (id: string) => {
    setExpandedFeature((current) => (current === id ? null : id));
  };

  const fillDevUser = (username: string) => {
    setUser(username);
    setPass(DEV_PASSWORD);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(user, pass);
      navigate('/inicio');
    } catch {
      setError('Credenciales inválidas. Verifique usuario y clave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rev-login">
      <div className="rev-login__ambient" aria-hidden="true" />
      <div className="rev-login__viewport">
        <div className="rev-login__shell">
          <section className="rev-login__hero">
            <div className="rev-login__hero-banner" aria-hidden="true">
              <img
                className="rev-login__hero-banner-img"
                src={REV_IMAGES.loginHero}
                alt=""
                loading="eager"
                decoding="async"
              />
              <div className="rev-login__hero-banner-fade" />
            </div>

            <div className="rev-login__hero-body">
              <RevLogo
                variant="horizontalLightTagline"
                size="lg"
                className="rev-login__hero-logo rev-login__hero-logo--wide"
              />
              <RevLogo
                variant="emblemLight"
                size="lg"
                className="rev-login__hero-logo rev-login__hero-logo--compact"
              />

              <p className="rev-login__hero-tagline">{REV_BRAND.tagline}</p>
              <p className="rev-login__hero-org">{REV_BRAND.municipality}</p>

              <div className="rev-login__features-wrap">
                <p className="rev-login__features-heading">Lo que REV le ofrece</p>
                <ul className="rev-login__features">
                  {LOGIN_FEATURES.map(({ id, icon, title, description }) => {
                    const isExpanded = expandedFeature === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className={`rev-login__feature-card${isExpanded ? ' rev-login__feature-card--open' : ''}`}
                          onClick={() => toggleFeature(id)}
                          aria-expanded={isExpanded}
                          aria-controls={`login-feature-${id}`}
                        >
                          <span className="rev-login__feature-head">
                            <span className="rev-login__feature-icon" aria-hidden="true">
                              <i className={`bi ${icon}`} />
                            </span>
                            <span className="rev-login__feature-copy">
                              <span className="rev-login__feature-title">{title}</span>
                            </span>
                            <i
                              className={`bi bi-chevron-down rev-login__feature-chevron${isExpanded ? ' rev-login__feature-chevron--open' : ''}`}
                              aria-hidden="true"
                            />
                          </span>
                          <div
                            id={`login-feature-${id}`}
                            className="rev-login__feature-detail"
                            role="region"
                            aria-hidden={!isExpanded}
                          >
                            <p>{description}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>

          <section className="rev-login__panel">
            <div className="rev-login__panel-body">
              <div className="rev-login__tabs" role="tablist" aria-label="Acceso REV">
                <button
                  type="button"
                  role="tab"
                  id="tab-ingresar"
                  aria-selected={activeTab === 'ingresar'}
                  aria-controls="panel-ingresar"
                  className={`rev-login__tab${activeTab === 'ingresar' ? ' rev-login__tab--active' : ''}`}
                  onClick={() => setActiveTab('ingresar')}
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-reportar"
                  aria-selected={activeTab === 'reportar'}
                  aria-controls="panel-reportar"
                  className={`rev-login__tab${activeTab === 'reportar' ? ' rev-login__tab--active' : ''}`}
                  onClick={() => setActiveTab('reportar')}
                >
                  Reportar emergencia
                </button>
              </div>

              {activeTab === 'ingresar' ? (
                <>
              <header className="rev-login__form-header">
                <span className="rev-login__eyebrow">Panel operativo</span>
                <h1 className="rev-login__title">Iniciar sesión</h1>
                <p className="rev-login__subtitle">
                  Ingrese sus credenciales para acceder al despacho.
                </p>
              </header>

              <form className="rev-login__form" onSubmit={handleSubmit} noValidate id="panel-ingresar" role="tabpanel" aria-labelledby="tab-ingresar">
                <div className="rev-field">
                  <label className="rev-field__label" htmlFor="login-user">
                    Usuario
                  </label>
                  <div className="rev-field__control">
                    <i className="bi bi-person rev-field__icon" aria-hidden="true" />
                    <input
                      id="login-user"
                      className="rev-field__input"
                      type="text"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      placeholder="nombre.apellido"
                      autoComplete="username"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="rev-field">
                  <label className="rev-field__label" htmlFor="login-pass">
                    Clave
                  </label>
                  <div className="rev-field__control">
                    <i className="bi bi-key rev-field__icon" aria-hidden="true" />
                    <input
                      id="login-pass"
                      className="rev-field__input"
                      type="password"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rev-login__error" role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="rev-login__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="rev-login__spinner" aria-hidden="true" />
                      Verificando…
                    </>
                  ) : (
                    <>
                      Ingresar al sistema
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="rev-login__dev">
                <button
                  type="button"
                  className="rev-login__dev-toggle"
                  onClick={() => setShowDevHint((v) => !v)}
                  aria-expanded={showDevHint}
                >
                  <i className="bi bi-code-slash" aria-hidden="true" />
                  Acceso desarrollo
                  <i
                    className={`bi bi-chevron-${showDevHint ? 'up' : 'down'} rev-login__dev-chevron`}
                    aria-hidden="true"
                  />
                </button>

                {showDevHint && (
                  <div className="rev-login__dev-panel">
                    <p className="rev-login__dev-note">
                      Clave compartida: <code>{DEV_PASSWORD}</code>
                    </p>
                    <div className="rev-login__dev-chips">
                      {DEV_USERS.map(({ user: devUser, role }) => (
                        <button
                          key={devUser}
                          type="button"
                          className="rev-login__dev-chip"
                          onClick={() => fillDevUser(devUser)}
                          disabled={isSubmitting}
                        >
                          <span className="rev-login__dev-chip-user">{devUser}</span>
                          <span className="rev-login__dev-chip-role">{role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
                </>
              ) : (
                <div id="panel-reportar" role="tabpanel" aria-labelledby="tab-reportar">
                  <header className="rev-login__form-header">
                    <span className="rev-login__eyebrow">Ciudadano</span>
                    <h1 className="rev-login__title">Reportar emergencia</h1>
                    <p className="rev-login__subtitle">
                      Envíe un reporte anónimo o identificado. No requiere cuenta.
                    </p>
                  </header>
                  <PublicReportForm
                    onSuccess={() => undefined}
                    onGoToLogin={() => setActiveTab('ingresar')}
                  />
                </div>
              )}
            </div>

            <footer className="rev-login__footer">
              <span>{REV_BRAND.name}</span>
              <span className="rev-login__footer-dot" aria-hidden="true" />
              <span>{new Date().getFullYear()}</span>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
