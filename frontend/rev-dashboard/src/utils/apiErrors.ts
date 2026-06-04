import { parseHttpErrorBody } from './httpErrorBody';

export function formatApiError(text: string, status: number): string {
  if (status === 401 || status === 403) {
    return 'Su sesión expiró. Inicie sesión nuevamente.';
  }
  const parsed = parseHttpErrorBody(text, status);
  if (parsed) {
    return parsed;
  }
  if (status === 404) {
    return 'Recurso no encontrado o servicio aún iniciando. Reintente o reconstruya el BFF (dev-up -Build).';
  }
  if (status === 503) {
    return 'Servicio no disponible. Si acaba de iniciar Docker, espere y reintente.';
  }
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    return json.message || json.error || text;
  } catch {
    return text || `Error ${status}`;
  }
}
