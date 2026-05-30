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

const TOKEN_KEY = 'rev_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
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

export async function fetchDashboard(): Promise<DashboardItem[]> {
  const token = getToken();
  if (!token) throw new Error('Sin token');
  const res = await fetch('/api/dashboard/incidentes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar dashboard');
  return res.json();
}
