import type { PathOptions } from 'leaflet';

import type { MapaIncidentePunto } from '../api';
import { riskVariant } from '../components/RiskBadge';
import { RISK_COLORS } from './riskColors';

export function zonaMapStyle(nivel: string, selected = false): PathOptions {
  const variant = riskVariant(nivel) as keyof typeof RISK_COLORS;
  const palette = RISK_COLORS[variant] ?? RISK_COLORS.unknown;
  return {
    color: palette.stroke,
    weight: selected ? 3 : 2,
    fillColor: palette.fill,
    fillOpacity: selected ? 0.45 : 0.35,
    dashArray: selected ? undefined : undefined,
  };
}

export function incidenteMapStyle(punto: MapaIncidentePunto, selected = false): PathOptions {
  const pending = punto.sugerenciasPendientes > 0;
  const grupo = punto.reportesEnGrupo > 1 || punto.tieneGrupoConfirmado;
  const color = pending ? '#fbbf24' : grupo ? '#3b82f6' : '#e85d04';
  return {
    color,
    weight: selected ? 3 : 2,
    fillColor: color,
    fillOpacity: selected ? 0.2 : grupo ? 0.14 : 0.1,
    dashArray: pending ? '4 6' : undefined,
  };
}

export function riskLabel(nivel: string): string {
  const n = nivel?.toUpperCase() ?? '';
  if (n === 'HIGH') return 'Alto';
  if (n === 'MEDIUM') return 'Medio';
  if (n === 'LOW') return 'Bajo';
  return nivel;
}
