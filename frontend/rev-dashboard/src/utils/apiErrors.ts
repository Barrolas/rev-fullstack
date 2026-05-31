export function formatApiError(text: string, status: number): string {
  if (status === 401 || status === 403) {
    return 'Sesión expirada o token inválido. Inicie sesión nuevamente.';
  }
  if (status === 503) {
    return 'Servicio temporalmente no disponible. Verifique que el backend esté en ejecución e intente de nuevo.';
  }
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    return json.message || json.error || text;
  } catch {
    return text || `Error ${status}`;
  }
}
