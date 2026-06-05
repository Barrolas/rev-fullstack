import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

import type { MapaIncidentePunto, Zona } from '../../api';
import {
  DEFAULT_MAP_ZOOM,
  INCIDENT_DETAIL_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  VALLE_DEL_SOL_CENTER,
} from '../../utils/mapConfig';
import { toZonaCircleViews, type ZonaCircleView } from '../../utils/territorialMapUtils';
import TerritorialMapLayers from './TerritorialMapLayers';

interface ZonasMapProps {
  zonas: Zona[];
  incidentes: MapaIncidentePunto[];
  radioCorrelacionMetros: number;
  selectedZoneId?: number | null;
  selectedIncidenteId?: string | null;
  onSelectZone?: (id: number) => void;
  onSelectIncidente?: (id: string) => void;
  showLegend?: boolean;
  className?: string;
}

function FitBounds({
  zonas,
  incidentes,
  enabled,
  dataKey,
}: {
  zonas: ZonaCircleView[];
  incidentes: MapaIncidentePunto[];
  enabled: boolean;
  dataKey: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const points: [number, number][] = [];
    zonas.forEach((z) => points.push([z.centerLat, z.centerLng]));
    incidentes.forEach((p) => {
      if (p.lat != null && p.lng != null) points.push([p.lat, p.lng]);
    });
    if (points.length === 0) {
      map.setView(VALLE_DEL_SOL_CENTER, DEFAULT_MAP_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 });
  }, [map, enabled, dataKey, zonas, incidentes]); // zonas/incidentes: datos al cambiar dataKey

  return null;
}

function FocusSelection({
  zonas,
  incidentes,
  selectedZoneId,
  selectedIncidenteId,
}: {
  zonas: ZonaCircleView[];
  incidentes: MapaIncidentePunto[];
  selectedZoneId?: number | null;
  selectedIncidenteId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncidenteId) {
      const p = incidentes.find(
        (i) => i.id === selectedIncidenteId || i.grupoId === selectedIncidenteId,
      );
      if (p?.lat != null && p?.lng != null) {
        map.setView([p.lat, p.lng], INCIDENT_DETAIL_ZOOM, { animate: true });
        return;
      }
    }
    if (selectedZoneId == null) return;
    const zone = zonas.find((z) => z.id === selectedZoneId);
    if (!zone) return;
    // Solo centrar; no reducir zoom al seleccionar una zona.
    map.panTo([zone.centerLat, zone.centerLng], { animate: true });
  }, [map, zonas, incidentes, selectedZoneId, selectedIncidenteId]);

  return null;
}

export default function ZonasMap({
  zonas,
  incidentes,
  radioCorrelacionMetros,
  selectedZoneId,
  selectedIncidenteId,
  onSelectZone,
  onSelectIncidente,
  showLegend = true,
  className,
}: ZonasMapProps) {
  const zonaCircles = useMemo(() => toZonaCircleViews(zonas), [zonas]);
  const hasSelection = selectedZoneId != null || selectedIncidenteId != null;
  const mapDataKey = useMemo(
    () =>
      `${zonaCircles.map((z) => z.id).join(',')}|${incidentes.map((i) => i.id).join(',')}`,
    [zonaCircles, incidentes],
  );

  return (
    <div className={['rev-zones-map', className].filter(Boolean).join(' ')}>
      <MapContainer
        center={VALLE_DEL_SOL_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        className="rev-zones-map__canvas"
        scrollWheelZoom
        zoomControl
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <FitBounds
          zonas={zonaCircles}
          incidentes={incidentes}
          enabled={!hasSelection}
          dataKey={mapDataKey}
        />
        <FocusSelection
          zonas={zonaCircles}
          incidentes={incidentes}
          selectedZoneId={selectedZoneId}
          selectedIncidenteId={selectedIncidenteId}
        />
        <TerritorialMapLayers
          zonas={zonaCircles}
          incidentes={incidentes}
          radioCorrelacionMetros={radioCorrelacionMetros}
          selectedZoneId={selectedZoneId}
          selectedIncidenteId={selectedIncidenteId}
          onSelectZone={onSelectZone}
          onSelectIncidente={onSelectIncidente}
        />
      </MapContainer>
      {showLegend && (
      <div className="rev-zones-map__legend" aria-hidden="true">
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--high">Zona alto</span>
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--medium">Zona medio</span>
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--low">Zona bajo</span>
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--incident">Incidente</span>
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--cluster">Agrupado</span>
      </div>
      )}
    </div>
  );
}
