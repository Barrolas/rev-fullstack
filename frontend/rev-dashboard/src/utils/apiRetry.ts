/** HTTP statuses típicos cuando Eureka/gateway aún no enrutan al microservicio. */
export function isRetryableHttpStatus(status: number): boolean {
  return status === 404 || status === 502 || status === 503 || status === 504;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Esperas entre reintentos (ms): 0 + 600 + 1200 + 2400 ≈ 4,2 s total. */
export const API_RETRY_DELAYS_MS = [0, 600, 1200, 2400] as const;

/** Login y 503 de arranque: ~21 s de reintentos por petición. */
export const LOGIN_RETRY_DELAYS_MS = [0, 1000, 2000, 3000, 5000, 5000] as const;

/** Intervalo entre sondeos de disponibilidad (login / post-login). */
export const STARTUP_POLL_INTERVAL_MS = 1000;

/** Pantalla de login: esperar ruta /auth antes de habilitar el formulario. */
export const STARTUP_AUTH_LOGIN_MAX_MS = 30_000;

/** Tras guardar el JWT: BFF + KEYCLOAK + filtro del gateway antes de entrar a la app. */
export const STARTUP_BACKEND_MAX_MS = 45_000;

export function maxApiAttempts(): number {
  return API_RETRY_DELAYS_MS.length;
}
