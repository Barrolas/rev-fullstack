import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapViewControllerProps {
  center: [number, number];
  zoom?: number;
  fly?: boolean;
}

/** Centra o anima el mapa cuando cambian las coordenadas (p. ej. GPS). */
export default function MapViewController({ center, zoom = 16, fly = false }: MapViewControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (fly) {
      map.flyTo(center, zoom, { duration: 0.65 });
    } else {
      map.setView(center, Math.max(map.getZoom(), zoom));
    }
  }, [center[0], center[1], fly, map, zoom]);

  return null;
}
