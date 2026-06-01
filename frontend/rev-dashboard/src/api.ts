export interface DashboardItem {
  incidente: {
    id: string;
    tipo: string;
    estado: string;
    lat: number;
    lng: number;
    descripcion: string;
  };
  zonaRiesgo: {
    nivel: string;
    cached: boolean;
  };
  recursos: Array<{
    tipo: string;
    descripcion: string;
    estado: string;
  }>;
  degraded: boolean;
}

export interface Zona {
  id: number;
  nombre: string;
  nivelRiesgo: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface RecursosDisponibles {
  brigadas: Array<{ id: number; nombre: string; capacidad: number; estado: string }>;
  vehiculos: Array<{ id: number; patente: string; tipo: string; estado: string }>;
  herramientas: Array<{ id: number; nombre: string; cantidadTotal: number; cantidadDisponible: number }>;
}

export interface IncidenteCreate {
  tipo: string;
  descripcion: string;
  lat: number;
  lng: number;
}

export interface AsignarRecurso {
  incidenteId: string;
  brigadaId: number;
  vehiculoId?: number;
}

import { formatApiError } from './utils/apiErrors';

const TOKEN_KEY = 'rev_token';

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username, password });
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Login fallido');
  const data = await res.json();
  setToken(data.access_token);
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401 || res.status === 403) {
      clearToken();
      window.location.assign('/login');
      throw new Error(formatApiError(text, res.status));
    }
    throw new Error(formatApiError(text, res.status));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchDashboard(): Promise<DashboardItem[]> {
  return apiFetch('/api/dashboard/incidentes');
}

export async function fetchDashboardItem(id: string): Promise<DashboardItem> {
  return apiFetch(`/api/dashboard/incidente/${id}`);
}

export async function createIncidente(data: IncidenteCreate): Promise<void> {
  await apiFetch('/api/incidentes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createPublicIncidente(data: IncidenteCreate): Promise<{ id: string }> {
  const res = await fetch('/api/public/incidentes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiError(text, res.status));
  }
  const payload = await res.json();
  return { id: payload.id ?? payload.incidente?.id ?? '' };
}

export async function fetchZonas(): Promise<Zona[]> {
  return apiFetch('/api/zonas');
}

export async function fetchRecursos(): Promise<RecursosDisponibles> {
  return apiFetch('/api/recursos/disponibles');
}

export async function asignarRecurso(data: AsignarRecurso): Promise<void> {
  await apiFetch('/api/recursos/asignar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
