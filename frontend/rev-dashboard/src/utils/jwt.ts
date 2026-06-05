export interface JwtPayload {
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Epoch ms del claim `exp`, o null si no se puede leer. */
export function getTokenExpiryMs(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function getPrimaryRole(roles: string[]): string {
  if (roles.includes('Admin')) return 'Admin';
  if (roles.includes('Despachador')) return 'Despachador';
  if (roles.includes('Brigadista')) return 'Brigadista';
  return roles[0] ?? 'Usuario';
}
