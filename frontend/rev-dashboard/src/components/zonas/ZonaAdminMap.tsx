import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import {
  DEFAULT_MAP_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  VALLE_DEL_SOL_CENTER,
} from '../../utils/mapConfig';
import { createRevZoneCenterMarkerIcon } from '../../utils/revZoneMapMarker';
import { zonaMapStyle } from '../../utils/zonaMapStyles';

export interface ZonaAdminMapProps {
  centerLat: number;
  centerLng: number;
  radioMetros: number;
  nivelRiesgo: string;
  onCenterChange: (lat: number, lng: number) => void;
  disabled?: boolean;
  layoutExpanded?: boolean;
  onLayoutExpandedChange?: (expanded: boolean) => void;
}

function MapClickPick({
  onPick,
  disabled,
}: {
  onPick: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (disabled) return;
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitZoneView({
  centerLat,
  centerLng,
  radioMetros,
}: {
  centerLat: number;
  centerLng: number;
  radioMetros: number;
}) {
  const map = useMap();

  useEffect(() => {
    const r = Math.max(radioMetros, 400);
    const delta = r / 111_320;
    const bounds = L.latLngBounds(
      [centerLat - delta, centerLng - delta],
      [centerLat + delta, centerLng + delta],
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15, animate: true });
  }, [map, centerLat, centerLng, radioMetros]);

  return null;
}

function ZoneMapLayers({
  centerLat,
  centerLng,
  radioMetros,
  nivelRiesgo,
  onCenterChange,
  disabled,
}: ZonaAdminMapProps) {
  const markerIcon = useMemo(() => createRevZoneCenterMarkerIcon(), []);

  return (
    <>
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <FitZoneView centerLat={centerLat} centerLng={centerLng} radioMetros={radioMetros} />
      <MapClickPick
        onPick={(lat, lng) => onCenterChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)))}
        disabled={disabled}
      />
      <Circle
        center={[centerLat, centerLng]}
        radius={Math.max(radioMetros, 50)}
        pathOptions={zonaMapStyle(nivelRiesgo, true)}
      />
      <Marker position={[centerLat, centerLng]} icon={markerIcon} />
    </>
  );
}

function MapCanvas(props: ZonaAdminMapProps & { className?: string }) {
  const { centerLat, centerLng, className } = props;
  return (
    <div className={`rev-zones-admin-map ${className ?? ''}`.trim()}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={DEFAULT_MAP_ZOOM}
        className="rev-zones-map__canvas"
        scrollWheelZoom
        zoomControl
      >
        <ZoneMapLayers {...props} />
      </MapContainer>
      <p className="rev-zones-admin-map__hint small text-muted mb-0">
        Clic en el mapa para mover el centro. El círculo refleja el radio configurado.
      </p>
    </div>
  );
}

export default function ZonaAdminMap({
  layoutExpanded = false,
  onLayoutExpandedChange,
  ...props
}: ZonaAdminMapProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const center: [number, number] = useMemo(() => {
    if (Number.isFinite(props.centerLat) && Number.isFinite(props.centerLng)) {
      return [props.centerLat, props.centerLng];
    }
    return VALLE_DEL_SOL_CENTER;
  }, [props.centerLat, props.centerLng]);

  const mapProps = { ...props, centerLat: center[0], centerLng: center[1] };

  return (
    <div className="rev-zones-admin-map-wrap">
      <div className="rev-zones-admin-map__toolbar">
        <Button
          type="button"
          size="sm"
          variant={layoutExpanded ? 'primary' : 'outline-secondary'}
          onClick={() => onLayoutExpandedChange?.(!layoutExpanded)}
        >
          <i
            className={`bi bi-${layoutExpanded ? 'arrows-angle-contract' : 'arrows-angle-expand'} me-1`}
          />
          {layoutExpanded ? 'Vista dividida' : 'Mapa ancho completo'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          onClick={() => setModalOpen(true)}
        >
          <i className="bi bi-fullscreen me-1" />
          Ampliar
        </Button>
      </div>
      <MapCanvas {...mapProps} />
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size="xl"
        centered
        className="rev-zones-admin-map-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ubicación y buffer de la zona</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MapCanvas {...mapProps} className="rev-zones-admin-map--modal" />
        </Modal.Body>
      </Modal>
    </div>
  );
}
