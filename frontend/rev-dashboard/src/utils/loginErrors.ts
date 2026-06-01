export function formatLoginError(text: string, status: number): string {
  if (status === 401 || status === 400) {
    return 'Usuario o clave incorrectos.';
  }
  if (status === 404) {
    return 'El servicio de autenticación no está disponible (ruta no encontrada). Verifique que el gateway esté en ejecución.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'Servicios aún iniciando. Espere unos segundos e intente de nuevo.';
  }
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    if (json.message) return json.message;
    if (json.error) return json.error;
  } catch {
    /* cuerpo no JSON */
  }
  if (text?.trim()) return text;
  return `No se pudo iniciar sesión (error ${status}).`;
}

export function formatLoginNetworkError(): string {
  return 'No se pudo conectar con el gateway. Verifique que el stack esté en ejecución (puerto 18080) y que Vite esté activo.';
}
