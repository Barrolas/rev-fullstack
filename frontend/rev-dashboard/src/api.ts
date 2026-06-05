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
    zonaId?: number;
    zonaNombre?: string;
    zonaNivelRiesgo?: string;
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
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  centerLat?: number;
  centerLng?: number;
  radioMetros?: number;
  comuna?: string;
  tipo?: string;
  activa?: boolean;
}

export interface ZonaPayload {
  nombre: string;
  nivelRiesgo: string;
  centerLat: number;
  centerLng: number;
  radioMetros: number;
  comuna?: string;
  tipo?: string;
}

export interface MapaIncidentePunto {
  id: string;
  grupoId: string;
  folio?: string;
  tipo: string;
  estado: string;
  lat?: number | null;
  lng?: number | null;
  direccionReferencia?: string;
  origenReporte?: string;
  nivelRiesgoZona: string;
  zonaNombre?: string;
  esCanonico: boolean;
  reportesEnGrupo: number;
  sugerenciasPendientes: number;
  tieneGrupoConfirmado: boolean;
}

export interface MapaTerritorial {
  radioCorrelacionMetros: number;
  zonas: Zona[];
  incidentes: MapaIncidentePunto[];
  incidentesSinUbicacion: number;
}

export interface ComunaItem {
  codigoCasen: number;
  nombre: string;
  codigoProvinciaCasen: number;
}

export interface InstitucionItem {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
}

export interface CompaniaItem {
  id: number;
  idInstitucion: number;
  idComuna: number;
  nombreComuna?: string;
  codigo: string;
  nombre: string;
  estado: string;
}

export interface BrigadaVehiculoItem {
  id: number;
  vehiculoId: number;
  patente?: string;
  tipo?: string;
  capacidadPasajeros?: number;
  principal: boolean;
  activa: boolean;
}

export interface BrigadaElegibilidad {
  brigadaId: number;
  listaParaDespacho: boolean;
  motivos: string[];
  integrantes: number;
  capacidadBrigada: number;
  capacidadPasajerosVehiculoPrincipal?: number;
}

export interface BrigadaItem {
  id: number;
  nombre: string;
  capacidad: number;
  estado: string;
  codigo?: string;
  idCompania?: number;
  idJefeBrigadista?: number;
  vehiculoId?: number | null;
}

export interface VehiculoItem {
  id: number;
  patente: string;
  tipo: string;
  estado: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  capacidadPasajeros?: number;
  capacidadCarga?: number;
}

export interface HerramientaItem {
  id: number;
  nombre: string;
  cantidadTotal: number;
  cantidadDisponible: number;
  marca?: string;
  modelo?: string;
  sku?: string;
  estado?: string;
}

export interface BrigadistaRolItem {
  id: number;
  codigo: string;
  nombre: string;
  jerarquia: number;
  estado: string;
}

export interface BrigadistaItem {
  id: number;
  nombre: string;
  apellido: string;
  rut?: string;
  especialidad?: string;
  estado: string;
  idBrigada?: number;
  idRolBrigadista?: number;
  rolCodigo?: string;
  rolNombre?: string;
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
  vehiculos?: BrigadaVehiculoItem[];
  idJefeBrigadista?: number | null;
  jefe?: BrigadistaItem | null;
  brigadistas: BrigadistaItem[];
  herramientas: Array<{ herramientaId: number; nombre: string; cantidad: number }>;
  listaParaDespacho: boolean;
}

export interface BrigadaComposicionPayload {
  jefeBrigadistaId?: number | null;
  vehiculoId?: number | null;
  vehiculoIds?: number[];
  principalVehiculoId?: number | null;
  brigadistaIds: number[];
  herramientas: Array<{ herramientaId: number; cantidad: number }>;
}

export interface DespachoColaItem {
  incidenteId: string;
  folio?: string;
  tipo: string;
  estado: string;
  descripcion: string;
  lat?: number;
  lng?: number;
  zonaNombre?: string;
  zonaNivelRiesgo?: string;
  conBrigadaAsignada: boolean;
  prioridad: number;
}

export interface DespachoBrigadaCard {
  id: number;
  nombre: string;
  codigo?: string;
  estado: string;
  listaParaDespacho: boolean;
  elegibilidad?: BrigadaElegibilidad;
  detalle?: BrigadaDetalle;
}

export interface DespachoColaResponse {
  cola: DespachoColaItem[];
  brigadasDisponibles: DespachoBrigadaCard[];
  recursosDegraded: boolean;
}

export interface AsignacionActiva {
  id: number;
  incidenteId: string;
  brigadaId: number;
  brigadaNombre?: string;
  vehiculoId?: number;
  vehiculoPatente?: string;
  estadoDespacho?: string;
  despachadoPor?: string;
  createdAt?: string;
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
  vehiculoIds?: number[];
  principalVehiculoId?: number;
  brigadistaIds?: number[];
  herramientas?: Array<{ herramientaId: number; cantidad: number }>;
  usarComposicionBrigada?: boolean;
  despachadoPor?: string;
}

export interface DespachoAsignarItem {
  brigadaId: number;
  vehiculoId?: number;
  principalVehiculoId?: number;
  vehiculoIds?: number[];
  brigadistaIds?: number[];
  herramientas?: Array<{ herramientaId: number; cantidad: number }>;
  usarComposicionBrigada?: boolean;
}

export interface DespachoAsignarLoteRequest {
  incidenteId: string;
  despachadoPor: string;
  items: DespachoAsignarItem[];
}

export interface DespachoAsignarLoteResultado {
  brigadaId: number;
  ok: boolean;
  asignacionId?: number;
  mensaje?: string;
}

export interface DespachoAsignarLoteResponse {
  exitosos: number;
  fallidos: number;
  resultados: DespachoAsignarLoteResultado[];
}

import { formatApiError } from './utils/apiErrors';
import { notifySessionExpired, SESSION_IDLE_MS } from './utils/sessionEvents';
import {
  LOGIN_RETRY_DELAYS_MS,
  API_RETRY_DELAYS_MS,
  STARTUP_AUTH_LOGIN_MAX_MS,
  STARTUP_BACKEND_MAX_MS,
  STARTUP_POLL_INTERVAL_MS,
  isRetryableHttpStatus,
  sleep,
} from './utils/apiRetry';
import { getTokenExpiryMs } from './utils/jwt';
import { formatLoginError, formatLoginNetworkError } from './utils/loginErrors';
const TOKEN_KEY = 'rev_token';
const REFRESH_TOKEN_KEY = 'rev_refresh_token';

/** Renovar access token unos minutos antes de que expire. */
const ACCESS_REFRESH_LEAD_MS = 2 * 60 * 1000;

let lastActivityAt = Date.now();
let refreshInFlight: Promise<void> | null = null;

export function touchSessionActivity(): void {
  lastActivityAt = Date.now();
}

function isSessionIdleExpired(): boolean {
  return Date.now() - lastActivityAt >= SESSION_IDLE_MS;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setAuthTokens(accessToken: string, refreshToken?: string | null) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  touchSessionActivity();
}

export function setToken(token: string) {
  setAuthTokens(token, getRefreshToken());
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<void> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error(SESSION_EXPIRED_MSG);
  }
  const body = new URLSearchParams({ refresh_token: refresh });
  const res = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(SESSION_EXPIRED_MSG);
  }
  let data: { access_token?: string; refresh_token?: string };
  try {
    data = JSON.parse(text) as { access_token?: string; refresh_token?: string };
  } catch {
    throw new Error(SESSION_EXPIRED_MSG);
  }
  if (!data.access_token) {
    throw new Error(SESSION_EXPIRED_MSG);
  }
  setAuthTokens(data.access_token, data.refresh_token ?? refresh);
}

async function ensureFreshAccessToken(): Promise<void> {
  touchSessionActivity();
  if (isSessionIdleExpired()) {
    clearToken();
    notifySessionExpired();
    throw new Error(SESSION_EXPIRED_MSG);
  }
  const token = getToken();
  if (!token) return;
  const exp = getTokenExpiryMs(token);
  if (exp != null && exp - Date.now() > ACCESS_REFRESH_LEAD_MS) {
    return;
  }
  if (!getRefreshToken()) {
    return;
  }
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  await refreshInFlight;
}

/** Cierra sesión local y revoca refresh en Keycloak cuando es posible. */
export async function logoutSession(): Promise<void> {
  const refresh = getRefreshToken();
  clearToken();
  notifySessionExpired();
  if (!refresh) return;
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ refresh_token: refresh }),
    });
  } catch {
    /* sin red o adapter caído */
  }
}

export type BackendStartupStep = 'bff' | 'auth-route' | 'auth-filter' | 'ready';

export interface BackendStartupProgress {
  step: BackendStartupStep;
  elapsedMs: number;
  message: string;
}

const STARTUP_STEP_MESSAGES: Record<BackendStartupStep, string> = {
  bff: 'Conectando con el BFF…',
  'auth-route': 'Iniciando autenticación (Keycloak)…',
  'auth-filter': 'Verificando acceso a las APIs…',
  ready: 'Servicios listos',
};

/** Comprueba si POST /auth/login ya enruta (200/401/400 = listo; 503 = arranque). */
export async function waitForAuthLogin(
  maxWaitMs = STARTUP_AUTH_LOGIN_MAX_MS,
  onProgress?: (elapsedMs: number) => void,
): Promise<boolean> {
  const started = Date.now();
  const deadline = started + maxWaitMs;
  const probe = new URLSearchParams({ username: '__rev_probe__', password: 'probe' });
  while (Date.now() < deadline) {
    onProgress?.(Date.now() - started);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: probe,
      });
      if (res.ok || res.status === 401 || res.status === 400) {
        return true;
      }
      if (!isRetryableHttpStatus(res.status)) {
        return false;
      }
    } catch {
      /* gateway aún no responde */
    }
    await sleep(STARTUP_POLL_INTERVAL_MS);
  }
  return false;
}

export async function login(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username, password });
  const delays = LOGIN_RETRY_DELAYS_MS;
  const maxAttempts = delays.length;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(delays[attempt]);
    }

    let res: Response;
    try {
      res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } catch {
      if (attempt < maxAttempts - 1) continue;
      throw new Error(formatLoginNetworkError());
    }

    const text = await res.text();
    if (res.ok) {
      let data: { access_token?: string; refresh_token?: string };
      try {
        data = JSON.parse(text) as { access_token?: string; refresh_token?: string };
      } catch {
        throw new Error('Respuesta de login inválida. Intente de nuevo.');
      }
      if (!data.access_token) {
        throw new Error('Respuesta de login sin token. Verifique Keycloak y el adaptador.');
      }
      setAuthTokens(data.access_token, data.refresh_token);
      const backendOk = await waitForRevBackend(STARTUP_BACKEND_MAX_MS);
      if (!backendOk) {
        throw new Error(
          'Sesión iniciada, pero los servicios REV aún no responden. Espere 20–30 s y pulse Ingresar de nuevo.',
        );
      }
      return;
    }

    if (isRetryableHttpStatus(res.status) && attempt < maxAttempts - 1) {
      continue;
    }
    throw new Error(formatLoginError(text, res.status));
  }
}

export type AuthFailureMode = 'redirect' | 'throw';

export interface ApiFetchInit extends RequestInit {
  authFailureMode?: AuthFailureMode;
}

const SESSION_EXPIRED_MSG =
  'Sesión expirada. Vuelva a ingresar (usuario dev: admin / rev123). Verifique que el gateway esté en el puerto 18080.';

function handleAuthFailure(text: string, status: number): never {
  clearToken();
  notifySessionExpired();
  throw new Error(formatApiError(text, status));
}

async function apiFetch<T>(url: string, options: ApiFetchInit = {}, attempt = 0): Promise<T> {
  const { authFailureMode = 'redirect', ...fetchOptions } = options;

  try {
    if (getToken()) {
      await ensureFreshAccessToken();
    }
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...fetchOptions.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();

      if (res.status === 401 || res.status === 403) {
        if (authFailureMode === 'throw') {
          clearToken();
          throw new Error(SESSION_EXPIRED_MSG);
        }
        handleAuthFailure(text, res.status);
      }

      if (isRetryableHttpStatus(res.status)) {
        const delays = res.status === 503 ? LOGIN_RETRY_DELAYS_MS : API_RETRY_DELAYS_MS;
        if (attempt < delays.length - 1) {
          await sleep(delays[attempt + 1]);
          return apiFetch<T>(url, options, attempt + 1);
        }
      }

      throw new Error(formatApiError(text, res.status));
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.message.includes('Sesión expirada')) {
      throw err;
    }
    if (err instanceof Error && (err.message.includes('sesión') || err.message.includes('sesion'))) {
      throw err;
    }
    const networkDelays = API_RETRY_DELAYS_MS;
    if (attempt < networkDelays.length - 1) {
      await sleep(networkDelays[attempt + 1]);
      return apiFetch<T>(url, options, attempt + 1);
    }
    if (err instanceof Error) throw err;
    throw new Error('No se pudo conectar con el servidor. Verifique que el gateway esté en ejecución.');
  }
}

/** BFF sin autenticación (arranque). */
async function probeBffReady(): Promise<boolean> {
  try {
    const res = await fetch('/api/ready', { headers: { 'Content-Type': 'application/json' } });
    return res.ok;
  } catch {
    return false;
  }
}

/** KEYCLOAK-ADAPTER vía ruta /auth (sin JWT). */
async function probeKeycloakAuthRoute(): Promise<boolean> {
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: '__rev_probe__', password: 'probe' }),
    });
    return res.ok || res.status === 401 || res.status === 400;
  } catch {
    return false;
  }
}

/** Filtro AuthenticationFilter del gateway (JWT + /roles). */
async function probeGatewayAuthFilter(): Promise<boolean> {
  const token = getToken();
  if (!token) return true;
  try {
    const res = await fetch('/api/ready/auth', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  }
}

/**
 * Espera a que BFF, KEYCLOAK-ADAPTER y el filtro JWT del gateway estén operativos.
 * Usar tras login y en BackendReadyGate antes de montar módulos con fetch.
 */
export async function waitForRevBackend(
  maxWaitMs = STARTUP_BACKEND_MAX_MS,
  onProgress?: (progress: BackendStartupProgress) => void,
): Promise<boolean> {
  const started = Date.now();
  const deadline = started + maxWaitMs;

  const report = (step: BackendStartupStep) => {
    onProgress?.({
      step,
      elapsedMs: Date.now() - started,
      message: STARTUP_STEP_MESSAGES[step],
    });
  };

  while (Date.now() < deadline) {
    report('bff');
    const bff = await probeBffReady();
    if (!bff) {
      await sleep(STARTUP_POLL_INTERVAL_MS);
      continue;
    }

    report('auth-route');
    const authRoute = await probeKeycloakAuthRoute();
    if (!authRoute) {
      await sleep(STARTUP_POLL_INTERVAL_MS);
      continue;
    }

    report('auth-filter');
    const authFilter = await probeGatewayAuthFilter();
    if (!authFilter) {
      await sleep(STARTUP_POLL_INTERVAL_MS);
      continue;
    }

    report('ready');
    return true;
  }
  return false;
}

const altaAuthOpts: ApiFetchInit = { authFailureMode: 'throw' };

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
    authFailureMode: 'throw',
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

export async function fetchZonas(incluirInactivas = false): Promise<Zona[]> {
  const q = incluirInactivas ? '?incluirInactivas=true' : '';
  return apiFetch(`/api/zonas${q}`);
}

export async function createZona(data: ZonaPayload): Promise<Zona> {
  return apiFetch('/api/zonas', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateZona(id: number, data: ZonaPayload): Promise<Zona> {
  return apiFetch(`/api/zonas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deactivateZona(id: number): Promise<void> {
  await apiFetch(`/api/zonas/${id}`, { method: 'DELETE' });
}

export async function recalcularZonasIncidentes(): Promise<{ actualizados: number }> {
  return apiFetch('/api/incidentes/recalcular-zonas', { method: 'POST' });
}

async function loadMapaTerritorialFallback(): Promise<MapaTerritorial> {
  const { buildMapaTerritorialFromDashboard } = await import('./utils/territorialMapUtils');
  const [zonas, dashboard] = await Promise.all([fetchZonas(), fetchDashboard()]);
  return buildMapaTerritorialFromDashboard(zonas, dashboard);
}

/** Mapa territorial: reintentos Eureka + fallback cliente si el endpoint BFF no está listo. */
export async function fetchMapaTerritorial(): Promise<MapaTerritorial> {
  const maxAttempts = API_RETRY_DELAYS_MS.length;
  let lastError = 'Error al cargar el mapa territorial';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(API_RETRY_DELAYS_MS[attempt]);
    }
    try {
      const res = await fetch('/api/mapa/territorial', {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
      });

      if (res.ok) {
        return (await res.json()) as MapaTerritorial;
      }

      const text = await res.text();
      if (res.status === 401 || res.status === 403) {
        handleAuthFailure(text, res.status);
      }

      if (res.status === 404) {
        return loadMapaTerritorialFallback();
      }

      lastError = formatApiError(text, res.status);
      if (!isRetryableHttpStatus(res.status)) {
        break;
      }
    } catch (err) {
      if (err instanceof Error && (err.message.includes('sesión') || err.message.includes('sesion'))) {
        throw err;
      }
      lastError =
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el servidor. Verifique que el gateway esté en ejecución.';
    }
  }

  try {
    return await loadMapaTerritorialFallback();
  } catch {
    throw new Error(lastError);
  }
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

export async function createBrigada(data: {
  nombre: string;
  capacidad: number;
  codigo?: string;
  idCompania?: number;
}): Promise<BrigadaItem> {
  return apiFetch('/api/recursos/brigadas', {
    ...altaAuthOpts,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createBrigadista(data: {
  nombre: string;
  apellido: string;
  rut?: string;
  especialidad?: string;
  idRolBrigadista?: number;
}): Promise<BrigadistaItem> {
  return apiFetch('/api/recursos/brigadistas', {
    ...altaAuthOpts,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createVehiculo(data: {
  patente: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  capacidadPasajeros?: number;
  capacidadCarga?: number;
}): Promise<VehiculoItem> {
  return apiFetch('/api/recursos/vehiculos', {
    ...altaAuthOpts,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createHerramienta(data: {
  nombre: string;
  cantidadTotal: number;
  marca?: string;
  modelo?: string;
  sku?: string;
  estado?: string;
}): Promise<HerramientaItem> {
  return apiFetch('/api/recursos/herramientas', {
    ...altaAuthOpts,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchBrigadistaRoles(): Promise<BrigadistaRolItem[]> {
  return apiFetch('/api/recursos/brigadista-roles');
}

export async function fetchComunasRecursos(): Promise<ComunaItem[]> {
  return apiFetch('/api/recursos/comunas');
}

export async function fetchInstituciones(): Promise<InstitucionItem[]> {
  return apiFetch('/api/recursos/instituciones');
}

export async function fetchCompanias(): Promise<CompaniaItem[]> {
  return apiFetch('/api/recursos/companias');
}

export async function fetchBrigadaElegibilidad(id: number): Promise<BrigadaElegibilidad> {
  return apiFetch(`/api/recursos/brigadas/${id}/elegibilidad-despacho`);
}

export async function updateBrigadaVehiculos(
  id: number,
  payload: { vehiculoIds: number[]; principalVehiculoId: number },
): Promise<BrigadaVehiculoItem[]> {
  return apiFetch(`/api/recursos/brigadas/${id}/vehiculos`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function fetchDespachoCola(): Promise<DespachoColaResponse> {
  return apiFetch('/api/despacho/cola');
}

export async function fetchDespachoActivos(): Promise<AsignacionActiva[]> {
  return apiFetch('/api/despacho/activos');
}

export async function liberarAsignacion(asignacionId: number): Promise<void> {
  await apiFetch(`/api/recursos/asignar/${asignacionId}`, { method: 'DELETE' });
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

export async function asignarDespachoLote(
  data: DespachoAsignarLoteRequest,
): Promise<DespachoAsignarLoteResponse> {
  return apiFetch('/api/despacho/asignar-lote', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      items: data.items.map((item) => ({
        ...item,
        usarComposicionBrigada: item.usarComposicionBrigada ?? true,
      })),
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
