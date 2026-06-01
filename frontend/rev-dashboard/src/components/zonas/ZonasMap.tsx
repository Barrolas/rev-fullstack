import { useEffect } from 'react';
import { MapContainer, Popup, Rectangle, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

import type { Zona } from '../../api';
import { riskLabel, zonaMapStyle } from '../../utils/zonaMapStyles';

interface ZonasMapProps {
  zonas: Zona[];
  selectedId?: number | null;
  onSelectZone?: (id: number) => void;
}

function FitBounds({ zonas }: { zonas: Zona[] }) {
  const map = useMap();

  useEffect(() => {
    if (zonas.length === 0) {
      map.setView([-33.45, -70.65], 9);
      return;
    }
    const points = zonas.flatMap((z) => [
      [z.minLat, z.minLng] as [number, number],
      [z.maxLat, z.maxLng] as [number, number],
    ]);
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 });
  }, [map, zonas]);

  return null;
}

function FocusZone({ zonas, selectedId }: { zonas: Zona[]; selectedId?: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedId == null) return;
    const zone = zonas.find((z) => z.id === selectedId);
    if (!zone) return;
    const bounds = L.latLngBounds([
      [zone.minLat, zone.minLng],
      [zone.maxLat, zone.maxLng],
    ]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [map, zonas, selectedId]);

  return null;
}

export default function ZonasMap({ zonas, selectedId, onSelectZone }: ZonasMapProps) {
  const defaultCenter: [number, number] = [-33.45, -70.65];

  return (
    <div className="rev-zones-map">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        className="rev-zones-map__canvas"
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds zonas={zonas} />
        <FocusZone zonas={zonas} selectedId={selectedId} />
        {zonas.map((z) => {
          const selected = selectedId === z.id;
          const bounds: L.LatLngBoundsExpression = [
            [z.minLat, z.minLng],
            [z.maxLat, z.maxLng],
          ];
          return (
            <Rectangle
              key={z.id}
              bounds={bounds}
              pathOptions={zonaMapStyle(z.nivelRiesgo, selected)}
              eventHandlers={{
                click: () => onSelectZone?.(z.id),
              }}
            >
              <Popup className="rev-zones-map__popup">
                <div className="rev-zones-map__popup-title">{z.nombre}</div>
                <div className="rev-zones-map__popup-meta">
                  Nivel: <strong>{riskLabel(z.nivelRiesgo)}</strong>
                </div>
                <p className="rev-zones-map__popup-hint">Toque la zona en el mapa para más detalle</p>
              </Popup>
            </Rectangle>
          );
        })}
      </MapContainer>
      <div className="rev-zones-map__legend" aria-hidden="true">
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--high">Alto</span>
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--medium">Medio</span>
        <span className="rev-zones-map__legend-item rev-zones-map__legend-item--low">Bajo</span>
      </div>
    </div>
  );
}
