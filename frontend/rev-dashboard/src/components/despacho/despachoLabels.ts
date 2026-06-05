export type RiesgoNivel = 'HIGH' | 'MEDIUM' | 'LOW' | 'DESCONOCIDO' | string;

export function riesgoLabel(nivel?: string): string {
  switch (nivel) {
    case 'HIGH':
      return 'Alto';
    case 'MEDIUM':
      return 'Medio';
    case 'LOW':
      return 'Bajo';
    case 'DESCONOCIDO':
      return 'Sin dato';
    default:
      return nivel ?? '—';
  }
}

export function estadoIncidenteLabel(estado: string): string {
  const map: Record<string, string> = {
    REPORTADO: 'Reportado',
    EN_PROGRESO: 'En progreso',
    ESCALADO: 'Escalado',
    CONTROLADO: 'Controlado',
    CERRADO: 'Cerrado',
  };
  return map[estado] ?? estado;
}

export function tipoIncidenteIcon(tipo: string): string {
  const t = tipo.toUpperCase();
  if (t.includes('FOREST') || t.includes('BOSQUE')) return 'bi-tree';
  if (t.includes('URBAN')) return 'bi-buildings';
  if (t.includes('INDUST')) return 'bi-gear';
  return 'bi-fire';
}

export function prioridadOrden(item: { prioridad: number; zonaNivelRiesgo?: string }): number {
  const riesgo =
    item.zonaNivelRiesgo === 'HIGH' ? 3 : item.zonaNivelRiesgo === 'MEDIUM' ? 2 : item.zonaNivelRiesgo === 'LOW' ? 1 : 0;
  return riesgo * 1000 + (item.prioridad ?? 0);
}

export type EstadoDespacho = 'ASIGNADA' | 'EN_CAMINO' | 'EN_INCIDENTE' | string;

export function estadoDespachoLabel(estado?: string): string {
  switch (estado) {
    case 'ASIGNADA':
      return 'Despachada';
    case 'EN_CAMINO':
      return 'En camino';
    case 'EN_INCIDENTE':
      return 'En incidente';
    default:
      return estado ?? 'En terreno';
  }
}

export function estadoDespachoCardClass(estado?: string): string {
  switch (estado) {
    case 'ASIGNADA':
      return 'rev-despacho-activos-card--asignada';
    case 'EN_CAMINO':
      return 'rev-despacho-activos-card--en-camino';
    case 'EN_INCIDENTE':
      return 'rev-despacho-activos-card--en-incidente';
    default:
      return '';
  }
}

export function siguienteEstadoDespacho(estado?: string): EstadoDespacho | null {
  switch (estado) {
    case 'ASIGNADA':
      return 'EN_CAMINO';
    case 'EN_CAMINO':
      return 'EN_INCIDENTE';
    default:
      return null;
  }
}

export function accionEstadoDespachoLabel(estado?: string): string | null {
  switch (estado) {
    case 'ASIGNADA':
      return 'Marcar en camino';
    case 'EN_CAMINO':
      return 'Brigada en incidente';
    default:
      return null;
  }
}
