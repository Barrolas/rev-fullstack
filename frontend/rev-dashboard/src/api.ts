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
    incidenteCanonicoId?: string;
    folioCanonico?: string;
    esCanonico?: boolean;
    cantidadReportesVinculados?: number;
    sugerenciasPendientes?: number;
    scoreMaximoPendiente?: number;
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

export interface BrigadaItem {
  id: number;
  nombre: string;
  capacidad: number;
  estado: string;
  vehiculoId?: number | null;
}

export interface VehiculoItem {
  id: number;
  patente: string;
  tipo: string;
  estado: string;
}

export interface HerramientaItem {
  id: number;
  nombre: string;
  cantidadTotal: number;
  cantidadDisponible: number;
}

export interface BrigadistaItem {
  id: number;
  nombre: string;
  apellido: string;
  rut?: string;
  especialidad?: string;
  estado: string;
}

export interface RecursosDisponibles {
  brigadas: BrigadaItem[];
  vehiculos: VehiculoItem[];
  herramientas: HerramientaItem[];
}

export interface RecursosCatalogo extends RecursosDisponibles {
  brigadistas: BrigadistaItem[];
}

export interface BrigadaDetalle {
  id: number;
  nombre: string;
  capacidad: number;
  estado: string;
  vehiculoId?: number | null;
  vehiculo?: VehiculoItem | null;
  brigadistas: BrigadistaItem[];
  herramientas: Array<{ herramientaId: number; nombre: string; cantidad: number }>;
  listaParaDespacho: boolean;
}

export interface BrigadaComposicionPayload {
  vehiculoId?: number | null;
  brigadistaIds: number[];
  herramientas: Array<{ herramientaId: number; cantidad: number }>;
}

export interface IncidenteCreate {
  tipo: string;
  descripcion: string;
  lat: number;
  lng: number;
  direccionReferencia?: string;
}

export interface AsignarRecurso {
  incidenteId: string;
  brigadaId: number;
  vehiculoId?: number;
  usarComposicionBrigada?: boolean;
}

import { formatApiError } from './utils/apiErrors';
import { formatLoginError, formatLoginNetworkError } from './utils/loginErrors';
import { API_RETRY_DELAYS_MS, isRetryableHttpStatus, sleep } from './utils/apiRetry';

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
  let res: Response;
  try {
    res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch {
    throw new Error(formatLoginNetworkError());
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(formatLoginError(text, res.status));
  }

  let data: { access_token?: string };
  try {
    data = JSON.parse(text) as { access_token?: string };
  } catch {
    throw new Error('Respuesta de login inválida. Intente de nuevo.');
  }

  if (!data.access_token) {
    throw new Error('Respuesta de login sin token. Verifique Keycloak y el adaptador.');
  }

  setToken(data.access_token);
}

function handleAuthFailure(text: string, status: number): never {
  clearToken();
  window.location.assign('/login');
  throw new Error(formatApiError(text, status));
}

async function apiFetch<T>(url: string, options: RequestInit = {}, attempt = 0): Promise<T> {
  const maxAttempts = API_RETRY_DELAYS_MS.length;

  try {
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
        handleAuthFailure(text, res.status);
      }

      if (isRetryableHttpStatus(res.status) && attempt < maxAttempts - 1) {
        await sleep(API_RETRY_DELAYS_MS[attempt + 1]);
        return apiFetch<T>(url, options, attempt + 1);
      }

      throw new Error(formatApiError(text, res.status));
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    if (err instanceof Error && (err.message.includes('sesión') || err.message.includes('sesion'))) {
      throw err;
    }
    if (attempt < maxAttempts - 1) {
      await sleep(API_RETRY_DELAYS_MS[attempt + 1]);
      return apiFetch<T>(url, options, attempt + 1);
    }
    if (err instanceof Error) throw err;
    throw new Error('No se pudo conectar con el servidor. Verifique que el gateway esté en ejecución.');
  }
}

/** Comprueba gateway + BFF + auth antes de mostrar módulos tras el splash. */
export async function waitForRevBackend(maxWaitMs = 24_000): Promise<boolean> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch('/api/ready', {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
      });
      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) return false;
    } catch {
      /* red / gateway aún no responde */
    }
    await sleep(800);
  }
  return false;
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

export async function fetchRecursosCatalogo(): Promise<RecursosCatalogo> {
  return apiFetch('/api/recursos/catalogo');
}

export async function fetchBrigadaDetalle(id: number): Promise<BrigadaDetalle> {
  return apiFetch(`/api/recursos/brigadas/${id}`);
}

export async function updateBrigadaComposicion(
  id: number,
  payload: BrigadaComposicionPayload,
): Promise<BrigadaDetalle> {
  return apiFetch(`/api/recursos/brigadas/${id}/composicion`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function createBrigada(data: { nombre: string; capacidad: number }): Promise<BrigadaItem> {
  return apiFetch('/api/recursos/brigadas', { method: 'POST', body: JSON.stringify(data) });
}

export async function createBrigadista(data: {
  nombre: string;
  apellido: string;
  rut?: string;
  especialidad?: string;
}): Promise<BrigadistaItem> {
  return apiFetch('/api/recursos/brigadistas', { method: 'POST', body: JSON.stringify(data) });
}

export async function createVehiculo(data: { patente: string; tipo: string }): Promise<VehiculoItem> {
  return apiFetch('/api/recursos/vehiculos', { method: 'POST', body: JSON.stringify(data) });
}

export async function createHerramienta(data: {
  nombre: string;
  cantidadTotal: number;
}): Promise<HerramientaItem> {
  return apiFetch('/api/recursos/herramientas', { method: 'POST', body: JSON.stringify(data) });
}

export async function asignarRecurso(data: AsignarRecurso): Promise<void> {
  await apiFetch('/api/recursos/asignar', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      usarComposicionBrigada: data.usarComposicionBrigada ?? true,
    }),
  });
}

export interface IncidenteResumen {
  id: string;
  folio?: string;
  tipo: string;
  estado: string;
  lat?: number | null;
  lng?: number | null;
  descripcion: string;
  origenReporte?: string;
  incidenteCanonicoId?: string;
  createdAt?: string;
}

export interface CorrelacionItem {
  id: string;
  incidenteA: IncidenteResumen;
  incidenteB: IncidenteResumen;
  score: number;
  distanciaMetros: number;
  deltaMinutos: number;
  motivo: Record<string, unknown>;
  estado: string;
  incidenteCanonicoId?: string;
  createdAt?: string;
}

export interface GrupoIncidente {
  incidenteCanonicoId: string;
  folioCanonico?: string;
  canonico: IncidenteResumen;
  vinculados: IncidenteResumen[];
  sugerenciasPendientes: CorrelacionItem[];
}

export async function fetchCorrelacionesPendientes(): Promise<CorrelacionItem[]> {
  return apiFetch('/api/incidentes/correlaciones/pendientes');
}

export async function fetchCorrelacionesPendientesCount(): Promise<number> {
  const data = await apiFetch<{ total: number }>('/api/incidentes/correlaciones/pendientes/count');
  return data.total;
}

export async function fetchIncidenteGrupo(id: string): Promise<GrupoIncidente> {
  return apiFetch(`/api/incidentes/${id}/grupo`);
}

export async function fetchIncidentePorFolio(folio: string): Promise<IncidenteResumen> {
  return apiFetch(`/api/incidentes/folio/${encodeURIComponent(folio.trim())}`);
}

export async function confirmarCorrelacion(
  correlacionId: string,
  incidenteCanonicoId: string,
): Promise<CorrelacionItem> {
  return apiFetch(`/api/incidentes/correlaciones/${correlacionId}/confirmar`, {
    method: 'POST',
    body: JSON.stringify({ incidenteCanonicoId }),
  });
}

export async function descartarCorrelacion(
  correlacionId: string,
  motivo?: string,
): Promise<CorrelacionItem> {
  return apiFetch(`/api/incidentes/correlaciones/${correlacionId}/descartar`, {
    method: 'POST',
    body: JSON.stringify(motivo ? { motivo } : {}),
  });
}
