import { getToken } from '../api';
import { decodeJwtPayload, getPrimaryRole } from '../utils/jwt';

const KEYCLOAK_BASE = (import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:18090').replace(/\/$/, '');
const KEYCLOAK_ADMIN_URL = `${KEYCLOAK_BASE}/admin/rev/console`;

export function useAuth() {
  const token = getToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const roles = payload?.realm_access?.roles?.filter((r) => !r.startsWith('default-roles')) ?? [];
  const username = payload?.preferred_username ?? 'Usuario';
  const displayName = payload?.given_name
    ? `${payload.given_name} ${payload.family_name ?? ''}`.trim()
    : username;
  const role = getPrimaryRole(roles);
  const isAdmin = roles.includes('Admin');
  const isDespachador = roles.includes('Despachador');
  const isBrigadista = roles.includes('Brigadista');
  const isOperador = isAdmin || isDespachador;
  const isBrigadistaOnly = isBrigadista && !isOperador;
  const canManageIncidents = isOperador;
  const canDispatch = isOperador;
  const canEditZonas = isOperador;
  const canManageCorrelaciones = isOperador;

  return {
    isAuthenticated: !!token,
    username,
    displayName,
    role,
    roles,
    isAdmin,
    isDespachador,
    isBrigadista,
    isBrigadistaOnly,
    isOperador,
    canManageIncidents,
    canDispatch,
    canEditZonas,
    canManageCorrelaciones,
    keycloakAdminUrl: KEYCLOAK_ADMIN_URL,
  };
}
