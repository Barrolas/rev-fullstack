import { REV_GEO } from '../../branding';

/** Capas decorativas del fondo — mapa, radar y coordenadas (sin interacción). */
export default function OperationalAmbient() {
  return (
    <div className="rev-main__ambient" aria-hidden="true">
      <div className="rev-main__ambient-layer rev-main__ambient-layer--base" />
      <div className="rev-main__ambient-layer rev-main__ambient-layer--grid" />
      <div className="rev-main__ambient-layer rev-main__ambient-layer--topo" />
      <div className="rev-main__ambient-layer rev-main__ambient-layer--radar">
        <svg className="rev-main__radar-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="0.75" />
          <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="36" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.5" />
          <line x1="100" y1="12" x2="100" y2="188" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="12" y1="100" x2="188" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <path
            d="M100 100 L100 12 A88 88 0 0 1 188 100 Z"
            fill="url(#rev-radar-sweep)"
            className="rev-main__radar-sweep"
          />
          <defs>
            <radialGradient id="rev-radar-sweep" cx="100" cy="100" r="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(249,115,22,0.12)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0)" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="rev-main__ambient-layer rev-main__ambient-layer--pins">
        <span className="rev-main__map-pin rev-main__map-pin--1" />
        <span className="rev-main__map-pin rev-main__map-pin--2" />
        <span className="rev-main__map-pin rev-main__map-pin--3" />
        <span className="rev-main__map-pin rev-main__map-pin--4" />
      </div>
      <div className="rev-main__ambient-layer rev-main__ambient-layer--coords">
        <span className="rev-main__coord rev-main__coord--tl">
          {REV_GEO.lat.toFixed(2)}° S · {Math.abs(REV_GEO.lng).toFixed(2)}° W
        </span>
        <span className="rev-main__coord rev-main__coord--br">{REV_GEO.label.toUpperCase()} · OPS</span>
        <span className="rev-main__coord rev-main__coord--tr">GRID REF · MUN-REV</span>
      </div>
    </div>
  );
}
