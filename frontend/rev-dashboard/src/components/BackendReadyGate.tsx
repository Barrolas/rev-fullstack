import { useEffect, useState } from 'react';

import { waitForRevBackend, type BackendStartupProgress } from '../api';
import { STARTUP_BACKEND_MAX_MS } from '../utils/apiRetry';

import StateView from './primitives/StateView';



interface BackendReadyGateProps {

  children: React.ReactNode;

}



function formatStartupHint(elapsedMs: number): string {

  const sec = Math.floor(elapsedMs / 1000);

  if (sec < 5) {

    return 'Tras iniciar Docker los servicios pueden tardar unos segundos.';

  }

  if (sec < 20) {

    return `Esperando servicios… ${sec} s (máx. ${Math.round(STARTUP_BACKEND_MAX_MS / 1000)} s).`;

  }

  return `Aún conectando… ${sec} s. Si acaba de levantar el stack, espere un poco más.`;

}



/**

 * Tras el login, espera BFF + autenticación + APIs antes de montar páginas que hacen fetch.

 */

export default function BackendReadyGate({ children }: BackendReadyGateProps) {

  const [phase, setPhase] = useState<'waiting' | 'ready' | 'timeout'>('waiting');

  const [progress, setProgress] = useState<BackendStartupProgress | null>(null);



  const runWait = (maxMs = STARTUP_BACKEND_MAX_MS) => {

    setPhase('waiting');

    setProgress(null);

    return waitForRevBackend(maxMs, setProgress).then((ok) => {

      setPhase(ok ? 'ready' : 'timeout');

    });

  };



  useEffect(() => {

    let cancelled = false;

    runWait().then(() => {

      if (cancelled) return;

    });

    return () => {

      cancelled = true;

    };

  }, []);



  if (phase === 'waiting') {

    const elapsed = progress?.elapsedMs ?? 0;

    const detail = progress?.message ?? 'Conectando con servicios REV…';

    return (

      <div className="rev-backend-ready">

        <StateView

          state="loading"

          loadingMessage={

            <>

              <span className="d-block fw-semibold mb-1">{detail}</span>

              <span className="d-block small text-muted">{formatStartupHint(elapsed)}</span>

            </>

          }

        />

      </div>

    );

  }



  if (phase === 'timeout') {

    return (

      <div className="rev-backend-ready">

        <StateView

          state="error"

          errorMessage="Los servicios REV aún no responden (BFF, autenticación o gateway). Compruebe Docker y pulse Reintentar."

          onRetry={() => runWait(STARTUP_BACKEND_MAX_MS)}

        />

      </div>

    );

  }



  return <>{children}</>;

}

