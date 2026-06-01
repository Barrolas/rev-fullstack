export interface DashboardItem {
  incidente: {
    id: string;
    folio?: string;
    tipo: string;
    estado: string;
    lat?: number | null;
    lng?: number | null;
    direccionReferencia?: string;
    descripcion: string;
    anonimo?: boolean;
    origenReporte?: string;
    reportanteNombre?: string;
    reportanteApellido?: string;
    reportanteRut?: string;
    reportanteContacto?: string;
    adjuntos?: AdjuntoMeta[];
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

export interface AdjuntoMeta {
  id: string;
  tipo: string;
  nombreArchivo: string;
  mimeType?: string;
  tamanoBytes?: number;
  orden?: number;
}

export interface PublicReportPayload {
  tipo: string;
  descripcion: string;
  lat?: number;
  lng?: number;
  direccionReferencia?: string;
  anonimo?: boolean;
  reportanteNombre?: string;
  reportanteApellido?: string;
  reportanteRut?: string;
  reportanteContacto?: string;
  registrarme?: boolean;
  registroUsername?: string;
  registroPassword?: string;
  registroEmail?: string;
}

export interface PublicReportResult {
  id?: string;
  folio?: string;
  mensaje: string;
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
  const result = await submitPublicReport({
    payload: {
      tipo: data.tipo,
      descripcion: data.descripcion,
      lat: data.lat,
      lng: data.lng,
      anonimo: true,
    },
    fotos: [],
    video: null,
    honeypot: '',
    formLoadedAt: Date.now() - 5000,
  });
  return { id: result.id ?? '' };
}

export interface SubmitPublicReportOptions {
  payload: PublicReportPayload;
  fotos: File[];
  video: File | null;
  honeypot: string;
  formLoadedAt: number;
  captchaToken?: string;
}

export async function submitPublicReport(options: SubmitPublicReportOptions): Promise<PublicReportResult> {
  const form = new FormData();
  form.append('payload', JSON.stringify(options.payload));
  form.append('formLoadedAt', String(options.formLoadedAt));
  if (options.honeypot) form.append('website', options.honeypot);
  if (options.captchaToken) form.append('captchaToken', options.captchaToken);
  options.fotos.forEach((foto) => form.append('fotos', foto, foto.name));
  if (options.video) form.append('video', options.video, options.video.name);

  const res = await fetch('/api/public/incidentes', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(formatApiError(text, res.status));
  }
  return res.json();
}

export function adjuntoUrl(incidenteId: string, adjuntoId: string): string {
  return `/api/incidentes/${incidenteId}/adjuntos/${adjuntoId}`;
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
