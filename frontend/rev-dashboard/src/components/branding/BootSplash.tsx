import { useEffect, useRef, useState } from 'react';
import { REV_BRAND } from '../../branding';
import RevLogo from './RevLogo';

interface BootSplashProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export default function BootSplash({ onComplete, minDurationMs = 2400 }: BootSplashProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const completedRef = useRef(false);

  useEffect(() => {
    const holdTimer = window.setTimeout(() => setPhase('hold'), 80);
    const exitTimer = window.setTimeout(() => setPhase('exit'), minDurationMs - 480);
    const doneTimer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, minDurationMs);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [minDurationMs, onComplete]);

  return (
    <div
      className={`rev-boot-splash rev-boot-splash--${phase}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando REV"
    >
      <div className="rev-boot-splash__ambient" aria-hidden="true">
        <span className="rev-boot-splash__orb rev-boot-splash__orb--1" />
        <span className="rev-boot-splash__orb rev-boot-splash__orb--2" />
      </div>

      <div className="rev-boot-splash__content">
        <div className="rev-boot-splash__emblem-wrap">
          <span className="rev-boot-splash__ring rev-boot-splash__ring--outer" aria-hidden="true" />
          <span className="rev-boot-splash__ring rev-boot-splash__ring--inner" aria-hidden="true" />
          <span className="rev-boot-splash__pulse" aria-hidden="true" />
          <RevLogo
            variant="emblemColor"
            size={88}
            className="rev-boot-splash__logo"
          />
        </div>

        <div className="rev-boot-splash__copy">
          <p className="rev-boot-splash__name">{REV_BRAND.shortName}</p>
          <p className="rev-boot-splash__tagline">{REV_BRAND.name}</p>
        </div>

        <div className="rev-boot-splash__progress" aria-hidden="true">
          <span className="rev-boot-splash__progress-track">
            <span className="rev-boot-splash__progress-fill" />
          </span>
          <span className="rev-boot-splash__progress-label">Preparando su despacho</span>
        </div>
      </div>
    </div>
  );
}
