import type { MapaIncidentePunto, Zona } from '../api';
import { zonaCircleFromBbox } from './geoUtils';

export interface ZonaCircleView {
  id: number;
  nombre: string;
  nivelRiesgo: string;
  centerLat: number;
  centerLng: number;
  radioMetros: number;
}

export function toZonaCircleViews(zonas: Zona[]): ZonaCircleView[] {
  return zonas.map((z) => {
    const circle = zonaCircleFromBbox(z);
    return {
      id: z.id,
      nombre: z.nombre,
      nivelRiesgo: z.nivelRiesgo,
      ...circle,
    };
  });
}

export function findIncidentePunto(
  incidentes: MapaIncidentePunto[],
  id: string | null | undefined,
): MapaIncidentePunto | null {
  if (!id) return null;
  return incidentes.find((p) => p.id === id || p.grupoId === id) ?? null;
}

export function formatOrigenReporte(origen?: string): string {
  if (!origen) return 'Interno';
  const o = origen.toUpperCase();
  if (o === 'PUBLICO' || o === 'PÚBLICO') return 'Reporte público';
  return origen;
}
