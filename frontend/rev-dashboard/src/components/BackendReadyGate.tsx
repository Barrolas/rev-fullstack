import { useEffect, useState } from 'react';
import { waitForRevBackend } from '../api';
import StateView from './primitives/StateView';

interface BackendReadyGateProps {
  children: React.ReactNode;
}

/**
 * Tras el login, espera a que gateway + BFF respondan antes de montar páginas que disparan fetch.
 * Evita 404/503 transitorios al abrir Zonas o Recursos justo después del arranque Docker.
 */
export default function BackendReadyGate({ children }: BackendReadyGateProps) {
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'timeout'>('waiting');

  useEffect(() => {
    let cancelled = false;
    waitForRevBackend().then((ok) => {
      if (cancelled) return;
      setPhase(ok ? 'ready' : 'timeout');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'waiting') {
    return (
      <div className="rev-backend-ready">
        <StateView
          state="loading"
          loadingMessage="Conectando con servicios REV… (puede tardar unos segundos tras iniciar Docker)"
        />
      </div>
    );
  }

  return <>{children}</>;
}
