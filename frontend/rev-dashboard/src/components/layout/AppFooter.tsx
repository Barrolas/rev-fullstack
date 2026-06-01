import { REV_BRAND } from '../../branding';

export default function AppFooter() {
  return (
    <footer className="rev-app-footer">
      <div className="rev-app-footer__inner">
        <div className="rev-app-footer__brand">
          <span className="rev-app-footer__mark" aria-hidden="true" />
          <span className="rev-app-footer__name">{REV_BRAND.shortName}</span>
          <span className="rev-app-footer__sep" aria-hidden="true">·</span>
          <span className="rev-app-footer__org">{REV_BRAND.municipality}</span>
        </div>
        <span className="rev-app-footer__hint">Panel de despacho municipal</span>
      </div>
    </footer>
  );
}
