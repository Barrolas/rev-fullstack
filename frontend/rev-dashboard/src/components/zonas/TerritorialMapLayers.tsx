import { useMemo } from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { MapaIncidentePunto } from '../../api';
import { createRevIncidentMarkerIcon } from '../../utils/revIncidentMapMarker';
import { incidenteMapStyle, riskLabel, zonaMapStyle } from '../../utils/zonaMapStyles';
import type { ZonaCircleView } from '../../utils/territorialMapUtils';
import ZonaIncidentePopup from './ZonaIncidentePopup';

interface TerritorialMapLayersProps {
  zonas: ZonaCircleView[];
  incidentes: MapaIncidentePunto[];
  radioCorrelacionMetros: number;
  selectedZoneId?: number | null;
  selectedIncidenteId?: string | null;
  onSelectZone?: (id: number) => void;
  onSelectIncidente?: (id: string) => void;
}

function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<span class="rev-map-cluster">${count}</span>`,
    className: 'rev-map-cluster-wrap',
    iconSize: L.point(40, 40),
  });
}

export default function TerritorialMapLayers({
  zonas,
  incidentes,
  radioCorrelacionMetros,
  selectedZoneId,
  selectedIncidenteId,
  onSelectZone,
  onSelectIncidente,
}: TerritorialMapLayersProps) {
  const markerIcon = useMemo(() => createRevIncidentMarkerIcon(), []);

  return (
    <>
      {zonas.map((z) => {
        const selected = selectedZoneId === z.id;
        return (
          <Circle
            key={`zona-${z.id}`}
            center={[z.centerLat, z.centerLng]}
            radius={z.radioMetros}
            pathOptions={zonaMapStyle(z.nivelRiesgo, selected)}
            eventHandlers={{
              click: () => onSelectZone?.(z.id),
            }}
          >
            <Popup className="rev-zones-map__popup" autoPan={false}>
              <div className="rev-zones-map__popup-title">{z.nombre}</div>
              <div className="rev-zones-map__popup-meta">
                Riesgo: <strong>{riskLabel(z.nivelRiesgo)}</strong>
              </div>
              <p className="rev-zones-map__popup-hint small mb-0">
                Buffer territorial · ~{Math.round(z.radioMetros / 1000)} km
              </p>
            </Popup>
          </Circle>
        );
      })}

      {incidentes.map((p) => {
        if (p.lat == null || p.lng == null) return null;
        const selected =
          selectedIncidenteId === p.id || selectedIncidenteId === p.grupoId;
        const grupoAmplio = p.reportesEnGrupo > 1 || p.tieneGrupoConfirmado;
        const radius = grupoAmplio
          ? radioCorrelacionMetros * 1.15
          : radioCorrelacionMetros;
        return (
          <Circle
            key={`buf-${p.grupoId}`}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={incidenteMapStyle(p, selected)}
            eventHandlers={{
              click: () => onSelectIncidente?.(p.id),
            }}
          />
        );
      })}

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={clusterIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
      >
        {incidentes.map((p) => {
          if (p.lat == null || p.lng == null) return null;
          return (
            <Marker
              key={`mk-${p.grupoId}`}
              position={[p.lat, p.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectIncidente?.(p.id),
              }}
            >
              <Popup className="rev-zones-map__popup" autoPan={false}>
                <ZonaIncidentePopup punto={p} />
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </>
  );
}
