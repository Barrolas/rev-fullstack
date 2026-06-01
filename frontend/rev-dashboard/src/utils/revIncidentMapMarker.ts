import L from 'leaflet';

/** Marcador DIV/SVG para reportes REV — evita PNG rotos de Leaflet en Vite. */
export function createRevIncidentMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'rev-map-marker',
    html: `
      <div class="rev-map-marker__wrap" role="presentation">
        <svg class="rev-map-marker__svg" viewBox="0 0 36 48" width="36" height="48" aria-hidden="true">
          <defs>
            <linearGradient id="rev-pin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fb923c"/>
              <stop offset="100%" stop-color="#ea580c"/>
            </linearGradient>
          </defs>
          <path fill="url(#rev-pin-grad)" stroke="#9a3412" stroke-width="1.2"
            d="M18 1C10.82 1 5 6.58 5 13.5c0 9.2 13 34.5 13 34.5S31 22.7 31 13.5C31 6.58 25.18 1 18 1z"/>
          <circle cx="18" cy="13.5" r="6.5" fill="#0b172a" opacity="0.35"/>
          <circle cx="18" cy="13.5" r="5" fill="#fff"/>
          <path fill="#ea580c" d="M18 10.2c-1.8 0-3.3 1.5-3.3 3.3 0 2.4 3.3 5.8 3.3 5.8s3.3-3.4 3.3-5.8c0-1.8-1.5-3.3-3.3-3.3zm0 4.6a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z"/>
        </svg>
        <span class="rev-map-marker__pulse" aria-hidden="true"></span>
      </div>
    `,
    iconSize: [36, 48],
    // Punta inferior del pin (centro X, base Y del viewBox 36×48)
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });
}

export const revIncidentMarkerIcon = createRevIncidentMarkerIcon();
