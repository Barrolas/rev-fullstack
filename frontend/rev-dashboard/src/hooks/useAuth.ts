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
  const canManageIncidents = roles.some((r) => ['Admin', 'Despachador'].includes(r));

  return {
    isAuthenticated: !!token,
    username,
    displayName,
    role,
    roles,
    isAdmin,
    canManageIncidents,
    keycloakAdminUrl: KEYCLOAK_ADMIN_URL,
  };
}
