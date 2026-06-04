import type { DashboardItem, MapaIncidentePunto, MapaTerritorial, Zona } from '../api';

const DEFAULT_RADIO_CORRELACION_METROS = 500;

/** Fallback cuando el BFF aún no expone GET /api/mapa/territorial (JAR antiguo en Docker). */
export function buildMapaTerritorialFromDashboard(
  zonas: Zona[],
  items: DashboardItem[],
  radioCorrelacionMetros = DEFAULT_RADIO_CORRELACION_METROS,
): MapaTerritorial {
  const porGrupo = new Map<string, DashboardItem[]>();
  let sinUbicacion = 0;

  for (const item of items) {
    const inc = item.incidente;
    if (inc.lat == null || inc.lng == null) {
      sinUbicacion += 1;
      continue;
    }
    const grupoId = inc.incidenteCanonicoId ?? inc.id;
    const list = porGrupo.get(grupoId) ?? [];
    list.push(item);
    porGrupo.set(grupoId, list);
  }

  const incidentes: MapaIncidentePunto[] = [];
  for (const [grupoId, miembros] of porGrupo) {
    const lider =
      miembros.find((d) => d.incidente.id === grupoId) ?? miembros[0];
    const inc = lider.incidente;
    const grupoConfirmado = miembros.some(
      (d) => d.incidente.incidenteCanonicoId != null,
    );
    const sugerencias = miembros.reduce(
      (sum, d) => sum + (d.incidente.sugerenciasPendientes ?? 0),
      0,
    );

    incidentes.push({
      id: inc.id,
      grupoId,
      folio: inc.folio,
      tipo: inc.tipo,
      estado: inc.estado,
      lat: inc.lat,
      lng: inc.lng,
      direccionReferencia: inc.direccionReferencia,
      origenReporte: inc.origenReporte,
      nivelRiesgoZona:
        inc.zonaNivelRiesgo ?? lider.zonaRiesgo?.nivel ?? 'DESCONOCIDO',
      zonaNombre: inc.zonaNombre,
      esCanonico: inc.esCanonico === true || inc.incidenteCanonicoId == null,
      reportesEnGrupo: miembros.length,
      sugerenciasPendientes: sugerencias,
      tieneGrupoConfirmado: grupoConfirmado && miembros.length > 1,
    });
  }

  return {
    radioCorrelacionMetros,
    zonas,
    incidentes,
    incidentesSinUbicacion: sinUbicacion,
  };
}

export interface ZonaCircleView {
  id: number;
  nombre: string;
  nivelRiesgo: string;
  centerLat: number;
  centerLng: number;
  radioMetros: number;
}

export function toZonaCircleViews(zonas: Zona[]): ZonaCircleView[] {
  return zonas
    .filter(
      (z) =>
        z.centerLat != null &&
        z.centerLng != null &&
        z.radioMetros != null &&
        z.radioMetros > 0,
    )
    .map((z) => ({
      id: z.id,
      nombre: z.nombre,
      nivelRiesgo: z.nivelRiesgo,
      centerLat: z.centerLat!,
      centerLng: z.centerLng!,
      radioMetros: z.radioMetros!,
    }));
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
