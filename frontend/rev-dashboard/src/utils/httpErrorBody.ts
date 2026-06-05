/** Interpreta respuestas JSON típicas de Spring Cloud Gateway / Boot. */
export function parseHttpErrorBody(text: string, status: number): string | null {
  if (!text?.trim()) {
    return null;
  }
  try {
    const json = JSON.parse(text) as {
      message?: string;
      error?: string;
      path?: string;
      status?: number;
    };
    const detail = json.message || (typeof json.error === 'string' ? json.error : null);
    if (detail && detail !== 'Service Unavailable' && detail !== 'Not Found') {
      return detail;
    }
    if (status === 503) {
      const path = json.path ? ` (${json.path})` : '';
      return (
        `Servicios REV aún iniciando${path}. Espere 15–30 s tras Docker y recargue la página. ` +
        'Si persiste: docker compose -p rev restart keycloak-adapter api-gateway bff-rev'
      );
    }
    if (status === 502 || status === 504) {
      return `El gateway no pudo contactar al servicio de autenticación (error ${status}). Reintente en unos segundos.`;
    }
    if (status === 404 && json.path) {
      return `Ruta no encontrada en el gateway: ${json.path}. Verifique que el stack REV esté actualizado.`;
    }
  } catch {
    /* no JSON */
  }
  return null;
}
