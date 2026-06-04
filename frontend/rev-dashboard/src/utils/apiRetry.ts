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

/** Login: más margen mientras KEYCLOAK-ADAPTER se registra en Eureka (~20 s). */
export const LOGIN_RETRY_DELAYS_MS = [0, 1000, 2000, 3000, 5000, 5000] as const;

export function maxApiAttempts(): number {
  return API_RETRY_DELAYS_MS.length;
}
