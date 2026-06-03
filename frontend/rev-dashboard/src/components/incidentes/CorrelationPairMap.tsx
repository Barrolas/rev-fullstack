import { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRevIncidentMarkerIcon } from '../../utils/revIncidentMapMarker';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '../../utils/mapConfig';

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

interface CorrelationPairMapProps {
  pointA: MapPoint;
  pointB: MapPoint;
  radioMetros?: number;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds.pad(0.25), { maxZoom: 16 });
  }, [map, points]);
  return null;
}

export default function CorrelationPairMap({ pointA, pointB, radioMetros = 400 }: CorrelationPairMapProps) {
  const points = useMemo(() => {
    const list: [number, number][] = [];
    if (pointA.lat != null && pointA.lng != null) list.push([pointA.lat, pointA.lng]);
    if (pointB.lat != null && pointB.lng != null) list.push([pointB.lat, pointB.lng]);
    return list;
  }, [pointA, pointB]);

  if (points.length === 0) {
    return <p className="text-muted small mb-0">Sin coordenadas para mostrar mapa.</p>;
  }

  const center = points[0];
  const markerIcon = createRevIncidentMarkerIcon();

  return (
    <div className="rev-correlacion-map">
      <MapContainer center={center} zoom={14} className="rev-correlacion-map__canvas" scrollWheelZoom={false}>
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <FitBounds points={points} />
        {pointA.lat != null && pointA.lng != null && (
          <>
            <Marker position={[pointA.lat, pointA.lng]} icon={markerIcon} />
            <Circle center={[pointA.lat, pointA.lng]} radius={radioMetros} pathOptions={{ color: '#e85d04', fillOpacity: 0.08 }} />
          </>
        )}
        {pointB.lat != null && pointB.lng != null && (
          <Marker position={[pointB.lat, pointB.lng]} icon={markerIcon} />
        )}
      </MapContainer>
      <div className="rev-correlacion-map__legend small text-muted mt-2">
        <span className="me-3"><i className="bi bi-circle-fill text-warning" /> {pointA.label}</span>
        <span><i className="bi bi-circle-fill text-primary" /> {pointB.label}</span>
      </div>
    </div>
  );
}
