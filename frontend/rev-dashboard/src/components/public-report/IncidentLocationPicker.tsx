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
import { OSM_ATTRIBUTION, OSM_TILE_URL, VALLE_DEL_SOL_CENTER } from '../../utils/mapConfig';

export interface LocationValue {
  lat: number | null;
  lng: number | null;
  direccionReferencia: string;
}

interface IncidentLocationPickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  disabled?: boolean;
  /** Permite ingresar latitud y longitud manualmente (despacho interno). */
  allowManualCoords?: boolean;
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
  allowManualCoords = false,
}: IncidentLocationPickerProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const reverseAbortRef = useRef<AbortController | null>(null);
  const searchBlurTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setLatText(value.lat != null ? String(value.lat) : '');
    setLngText(value.lng != null ? String(value.lng) : '');
  }, [value.lat, value.lng]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (value.lat != null && value.lng != null) {
      return [value.lat, value.lng];
    }
    return VALLE_DEL_SOL_CENTER;
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

      setSearchResults([]);
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

  const applyManualCoords = () => {
    const lat = parseFloat(latText.trim().replace(',', '.'));
    const lng = parseFloat(lngText.trim().replace(',', '.'));
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setGeoError('Ingrese latitud (-90 a 90) y longitud (-180 a 180) válidas.');
      return;
    }
    setGeoError('');
    void applyLocation(lat, lng, { flyTo: true });
  };

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
    if (!searchFocused || searchInput.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchAddress(searchInput, controller.signal);
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
  }, [searchFocused, searchInput]);

  useEffect(
    () => () => {
      reverseAbortRef.current?.abort();
      if (searchBlurTimerRef.current != null) {
        window.clearTimeout(searchBlurTimerRef.current);
      }
    },
    [],
  );

  const handleSearchFocus = () => {
    if (searchBlurTimerRef.current != null) {
      window.clearTimeout(searchBlurTimerRef.current);
      searchBlurTimerRef.current = null;
    }
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    searchBlurTimerRef.current = window.setTimeout(() => {
      setSearchFocused(false);
      setSearchResults([]);
    }, 200);
  };

  const selectSearchResult = (result: NominatimSearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (searchBlurTimerRef.current != null) {
      window.clearTimeout(searchBlurTimerRef.current);
      searchBlurTimerRef.current = null;
    }
    setSearchInput('');
    setSearchFocused(false);
    onChange({
      lat,
      lng,
      direccionReferencia: result.display_name,
    });
    setSearchResults([]);
    setFlyToCenter([lat, lng]);
  };

  const busy = geoLoading || resolvingAddress;
  const gpsLabel = geoLoading
    ? 'Obteniendo…'
    : resolvingAddress
      ? 'Ubicando…'
      : 'Mi ubicación';

  return (
    <div className="rev-public-location">
      <div className="rev-public-location__toolbar">
        <button
          type="button"
          className="rev-public-location__gps"
          onClick={useMyLocation}
          disabled={disabled || busy}
        >
          <i className={`bi ${busy ? 'bi-arrow-repeat' : 'bi-crosshair'}`} aria-hidden="true" />
          {gpsLabel}
        </button>
        {value.lat != null && value.lng != null && (
          <span className="rev-public-location__coords">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>

      {geoError && (
        <p className="rev-public-location__status rev-public-location__status--warn" role="alert">
          {geoError}
        </p>
      )}

      {allowManualCoords && (
        <div className="rev-public-location__manual-coords">
          <label className="rev-field__label" htmlFor="location-lat-manual">
            Coordenadas manuales
          </label>
          <div className="rev-public-location__manual-row">
            <input
              id="location-lat-manual"
              className="rev-public-location__manual-input"
              type="text"
              inputMode="decimal"
              placeholder="Latitud"
              value={latText}
              onChange={(e) => setLatText(e.target.value)}
              disabled={disabled || busy}
              aria-label="Latitud"
            />
            <input
              className="rev-public-location__manual-input"
              type="text"
              inputMode="decimal"
              placeholder="Longitud"
              value={lngText}
              onChange={(e) => setLngText(e.target.value)}
              disabled={disabled || busy}
              aria-label="Longitud"
            />
            <button
              type="button"
              className="rev-public-location__manual-apply"
              onClick={applyManualCoords}
              disabled={disabled || busy}
            >
              Aplicar
            </button>
          </div>
          <p className="rev-public-location__ref-note mb-0">
            Ejemplo: -33.59279, -70.57909. También puede marcar el punto en el mapa.
          </p>
        </div>
      )}

      <div className="rev-public-location__search-wrap">
        <label className="rev-field__label" htmlFor="location-search">
          Buscar dirección
        </label>
        <i className="bi bi-search rev-public-location__search-icon" aria-hidden="true" />
        <input
          id="location-search"
          className="rev-public-location__search-input"
          type="search"
          placeholder="Ej: Av. Principal 120, sector norte"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          disabled={disabled}
          autoComplete="off"
        />
        {searchFocused && searching && (
          <p className="rev-public-location__status">Buscando…</p>
        )}
        {searchFocused && !searching && searchInput.trim().length >= 3 && searchResults.length === 0 && (
          <p className="rev-public-location__status rev-public-location__status--warn">
            Sin resultados. Pruebe «Concha y Toro» o marque el punto en el mapa.
          </p>
        )}
        {searchFocused && searchResults.length > 0 && (
          <ul className="rev-public-location__results">
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

      <div className="rev-public-location__map-block">
        <p className="rev-public-location__map-label">
          <i className="bi bi-hand-index-thumb" aria-hidden="true" />
          Toque el mapa o arrastre el pin
        </p>
        <MapContainer
          center={mapCenter}
          zoom={12}
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

      <div className="rev-public-form__field">
        <label className="rev-field__label" htmlFor="direccion-referencia">
          Referencia de ubicación *
        </label>
        <textarea
          id="direccion-referencia"
          className="rev-public-form__textarea"
          rows={2}
          placeholder="Calle, sector o punto de referencia"
          value={value.direccionReferencia}
          onChange={(e) => onChange({ ...value, direccionReferencia: e.target.value })}
          disabled={disabled}
          required
        />
        <p className="rev-public-location__ref-note">
          Con GPS o mapa se completa automáticamente; puede editarla si hace falta.
        </p>
      </div>
    </div>
  );
}
