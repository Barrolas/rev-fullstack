import { useEffect } from 'react';
import { logoutSession, touchSessionActivity } from '../api';
import { SESSION_IDLE_MS } from '../utils/sessionEvents';

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
];

/**
 * Reinicia el reloj de inactividad con interacción del usuario y cierra sesión al vencer.
 */
export function useSessionIdle(timeoutMs = SESSION_IDLE_MS) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const resetTimer = () => {
      touchSessionActivity();
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void logoutSession();
      }, timeoutMs);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      if (timer) clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs]);
}
