export function formatApiError(text: string, status: number): string {
  if (status === 401 || status === 403) {
    return 'Su sesión expiró. Inicie sesión nuevamente.';
  }
  if (status === 404) {
    return 'Los servicios aún se están iniciando. Espere unos segundos y pulse Reintentar.';
  }
  if (status === 503) {
    return 'El servicio no está disponible en este momento. Intente de nuevo en unos minutos.';
  }
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    return json.message || json.error || text;
  } catch {
    return text || `Error ${status}`;
  }
}
