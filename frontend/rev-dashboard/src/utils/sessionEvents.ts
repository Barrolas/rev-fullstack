/** Cierre de sesión tras 30 minutos sin actividad (alineado a Keycloak ssoSessionIdleTimeout). */
export const SESSION_IDLE_MS = 30 * 60 * 1000;

/** Disparado cuando el gateway rechaza el JWT (401/403). Evita recargar toda la SPA. */
export const REV_SESSION_EXPIRED = 'rev:session-expired';

export function notifySessionExpired(): void {
  window.dispatchEvent(new CustomEvent(REV_SESSION_EXPIRED));
}
