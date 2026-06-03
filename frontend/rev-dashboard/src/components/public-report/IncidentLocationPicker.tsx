import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import { revIncidentMarkerIcon } from '../../utils/revIncidentMapMarker';
import {
  gpsFallbackLabel,
  NominatimSearchResult,
  reverseGeocode,
  searchAddress,
} from '../../utils/nominatim';
import MapViewController from './MapViewController';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '../../utils/mapConfig';

const VALLE_CENTER: [number, number] = [-33.452, -70.664];

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
  const [searchQuery, setSearchQuery] = useState(value.direccionReferencia);
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);

  const mapCenter = useMemo<[number, number]>(() => {
    if (value.lat != null && value.lng != null) {
      return [value.lat, value.lng];
    }
    return VALLE_CENTER;
  }, [value.lat, value.lng]);

  const applyLocation = useCallback(
    async (lat: number, lng: number, options?: { flyTo?: boolean }) => {
      const roundedLat = Number(lat.toFixed(6));
      const roundedLng = Number(lng.toFixed(6));

      reverseAbortRef.current?.abort();
      const controller = new AbortController();
      reverseAbortRef.current = controller;

      setResolvingAddress(true);
      let direccion = '';
      try {
        const label = await reverseGeocode(roundedLat, roundedLng, controller.signal);
        direccion = label ?? gpsFallbackLabel(roundedLat, roundedLng);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          direccion = gpsFallbackLabel(roundedLat, roundedLng);
        } else {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setResolvingAddress(false);
        }
      }

      setSearchQuery(direccion);
      onChange({
        lat: roundedLat,
        lng: roundedLng,
        direccionReferencia: direccion,
      });

      if (options?.flyTo) {
        setFlyToCenter([roundedLat, roundedLng]);
      }
    },
    [onChange],
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
        void applyLocation(pos.coords.latitude, pos.coords.longitude, { flyTo: true }).finally(
          () => setGeoLoading(false),
        );
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
        const data = await searchAddress(searchQuery, controller.signal);
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

  useEffect(
    () => () => {
      reverseAbortRef.current?.abort();
    },
    [],
  );

  const selectSearchResult = (result: NominatimSearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery(result.display_name);
    onChange({
      lat,
      lng,
      direccionReferencia: result.display_name,
    });
    setSearchResults([]);
    setFlyToCenter([lat, lng]);
  };

  const busy = geoLoading || resolvingAddress;

  return (
    <div className="rev-public-location">
      <div className="d-flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          className="rev-login__dev-chip"
          onClick={useMyLocation}
          disabled={disabled || busy}
        >
          <i className={`bi ${busy ? 'bi-arrow-repeat' : 'bi-geo-alt'} me-1`} />
          {geoLoading
            ? 'Obteniendo ubicación…'
            : resolvingAddress
              ? 'Buscando dirección…'
              : 'Usar mi ubicación'}
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
        <p className="rev-public-location__map-hint small text-muted mb-1">
          <i className="bi bi-cursor me-1" aria-hidden="true" />
          Toque el mapa o arrastre el pin para indicar el punto del incidente
        </p>
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={!disabled}
          className={`rev-public-map${disabled ? ' rev-public-map--disabled' : ''}`}
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {flyToCenter && <MapViewController center={flyToCenter} zoom={17} fly />}
          <MapClickHandler
            onSelect={(lat, lng) => void applyLocation(lat, lng)}
            disabled={disabled || busy}
          />
          {value.lat != null && value.lng != null && (
            <Marker
              position={[value.lat, value.lng]}
              icon={revIncidentMarkerIcon}
              draggable={!disabled && !busy}
              eventHandlers={{
                dragend: (e: L.DragEndEvent) => {
                  const marker = e.target as L.Marker;
                  const { lat, lng } = marker.getLatLng();
                  void applyLocation(lat, lng);
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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onChange({ ...value, direccionReferencia: e.target.value });
          }}
          disabled={disabled}
          required
        />
        <p className="small text-muted mt-1 mb-0">
          Al usar GPS o marcar en el mapa se completa una dirección de referencia automáticamente.
        </p>
      </div>
    </div>
  );
}
