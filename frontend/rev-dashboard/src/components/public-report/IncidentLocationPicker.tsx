import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const VALLE_CENTER: [number, number] = [-33.452, -70.664];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface LocationValue {
  lat: number | null;
  lng: number | null;
  direccionReferencia: string;
}

interface IncidentLocationPickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  disabled?: boolean;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function MapClickHandler({
  onSelect,
  disabled,
}: {
  onSelect: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (disabled) return;
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function IncidentLocationPicker({
  value,
  onChange,
  disabled = false,
}: IncidentLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const mapCenter = useMemo<[number, number]>(() => {
    if (value.lat != null && value.lng != null) {
      return [value.lat, value.lng];
    }
    return VALLE_CENTER;
  }, [value.lat, value.lng]);

  const updateCoords = useCallback(
    (lat: number, lng: number) => {
      onChange({
        ...value,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      });
    },
    [onChange, value],
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Su navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateCoords(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoError('No se pudo obtener su ubicación. Use el mapa o busque una dirección.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: `${searchQuery.trim()}, Valle del Sol, Chile`,
          format: 'json',
          limit: '5',
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as NominatimResult[];
        setSearchResults(data);
      } catch {
        /* búsqueda cancelada o fallida */
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const selectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange({
      lat,
      lng,
      direccionReferencia: result.display_name,
    });
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="rev-public-location">
      <div className="d-flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          className="rev-login__dev-chip"
          onClick={useMyLocation}
          disabled={disabled || geoLoading}
        >
          <i className={`bi ${geoLoading ? 'bi-arrow-repeat' : 'bi-geo-alt'} me-1`} />
          {geoLoading ? 'Obteniendo…' : 'Usar mi ubicación'}
        </button>
        {value.lat != null && value.lng != null && (
          <span className="small text-muted align-self-center">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>

      {geoError && (
        <p className="small text-warning mb-2" role="alert">
          {geoError}
        </p>
      )}

      <div className="rev-public-location__search mb-2">
        <label className="rev-field__label" htmlFor="location-search">
          Buscar dirección o referencia
        </label>
        <input
          id="location-search"
          className="rev-field__input w-100"
          type="search"
          placeholder="Ej: Av. Principal 120, sector norte"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
        {searching && <p className="small text-muted mt-1 mb-0">Buscando…</p>}
        {searchResults.length > 0 && (
          <ul className="rev-public-location__results list-unstyled mb-0 mt-1">
            {searchResults.map((r) => (
              <li key={`${r.lat}-${r.lon}-${r.display_name}`}>
                <button
                  type="button"
                  className="rev-public-location__result-btn"
                  onClick={() => selectSearchResult(r)}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rev-public-location__map mb-2">
        <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={!disabled} className="rev-public-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={updateCoords} disabled={disabled} />
          {value.lat != null && value.lng != null && (
            <Marker
              position={[value.lat, value.lng]}
              draggable={!disabled}
              eventHandlers={{
                dragend: (e: L.DragEndEvent) => {
                  const marker = e.target as L.Marker;
                  const { lat, lng } = marker.getLatLng();
                  updateCoords(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="rev-field">
        <label className="rev-field__label" htmlFor="direccion-referencia">
          Referencia de ubicación *
        </label>
        <textarea
          id="direccion-referencia"
          className="rev-field__input w-100"
          rows={2}
          placeholder="Indique calle, sector, punto de referencia o marque en el mapa"
          value={value.direccionReferencia}
          onChange={(e) => onChange({ ...value, direccionReferencia: e.target.value })}
          disabled={disabled}
          required
        />
        <p className="small text-muted mt-1 mb-0">
          Marque el punto en el mapa, use GPS o escriba una referencia clara dentro del valle.
        </p>
      </div>
    </div>
  );
}
