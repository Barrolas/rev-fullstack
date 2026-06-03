import L from 'leaflet';

/** Pin compacto para edición de centro de zona (administración). */
export function createRevZoneCenterMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'rev-map-marker rev-map-marker--zone',
    html: `
      <div class="rev-map-marker__wrap rev-map-marker__wrap--zone" role="presentation">
        <svg class="rev-map-marker__svg rev-map-marker__svg--zone" viewBox="0 0 24 32" width="22" height="30" aria-hidden="true">
          <path fill="#f97316" stroke="#9a3412" stroke-width="1"
            d="M12 1C7.03 1 3 5.03 3 10c0 7.5 9 21 9 21s9-13.5 9-21c0-4.97-4.03-9-9-9z"/>
          <circle cx="12" cy="10" r="4" fill="#fff"/>
        </svg>
      </div>
    `,
    iconSize: [22, 30],
    iconAnchor: [11, 30],
    popupAnchor: [0, -28],
  });
}
