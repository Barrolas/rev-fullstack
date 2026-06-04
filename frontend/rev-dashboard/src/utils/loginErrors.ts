import { parseHttpErrorBody } from './httpErrorBody';

export function formatLoginError(text: string, status: number): string {
  if (status === 401 || status === 400) {
    return 'Usuario o clave incorrectos.';
  }

  const parsed = parseHttpErrorBody(text, status);
  if (parsed) {
    return parsed;
  }

  if (status === 404) {
    return 'El servicio de autenticación no está disponible (ruta no encontrada). Verifique que el gateway esté en el puerto 18080.';
  }

  return `No se pudo iniciar sesión (error ${status}).`;
}

export function formatLoginNetworkError(): string {
  return 'No se pudo conectar con el gateway. Verifique que el stack esté en ejecución (puerto 18080) y que Vite esté activo.';
}
