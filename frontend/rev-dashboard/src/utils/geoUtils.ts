const EARTH_RADIUS_METERS = 6_371_000;

export function haversineMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function zonaCircleFromBbox(zona: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  centerLat?: number;
  centerLng?: number;
  radioMetros?: number;
}): { centerLat: number; centerLng: number; radioMetros: number } {
  if (
    zona.centerLat != null &&
    zona.centerLng != null &&
    zona.radioMetros != null &&
    zona.radioMetros > 0
  ) {
    return {
      centerLat: zona.centerLat,
      centerLng: zona.centerLng,
      radioMetros: zona.radioMetros,
    };
  }
  const centerLat = (zona.minLat + zona.maxLat) / 2;
  const centerLng = (zona.minLng + zona.maxLng) / 2;
  const r1 = haversineMetros(centerLat, centerLng, zona.maxLat, centerLng);
  const r2 = haversineMetros(centerLat, centerLng, centerLat, zona.maxLng);
  const r3 = haversineMetros(centerLat, centerLng, zona.minLat, centerLng);
  const r4 = haversineMetros(centerLat, centerLng, centerLat, zona.minLng);
  return { centerLat, centerLng, radioMetros: Math.max(r1, r2, r3, r4) };
}
