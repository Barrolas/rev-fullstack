const NOMINATIM_HEADERS: HeadersInit = {
  Accept: 'application/json',
  'User-Agent': 'REV-Dashboard/1.0 (emergency-report; local-dev)',
};

export interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

interface NominatimReverseResult {
  display_name?: string;
  address?: NominatimAddress;
}

function formatAddressParts(address: NominatimAddress): string {
  const line1 = [address.road, address.house_number].filter(Boolean).join(' ');
  const line2 = address.suburb || address.neighbourhood;
  const locality = address.city || address.town || address.village || address.municipality;
  return [line1, line2, locality, address.state].filter(Boolean).join(', ');
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    zoom: '18',
    addressdetails: '1',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    signal,
    headers: NOMINATIM_HEADERS,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as NominatimReverseResult;
  if (data.display_name?.trim()) {
    return data.display_name.trim();
  }
  if (data.address) {
    const formatted = formatAddressParts(data.address);
    if (formatted) return formatted;
  }
  return null;
}

export function gpsFallbackLabel(lat: number, lng: number): string {
  return `Ubicación GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
}

export async function searchAddress(
  query: string,
  signal?: AbortSignal,
): Promise<NominatimSearchResult[]> {
  const params = new URLSearchParams({
    q: `${query.trim()}, Valle del Sol, Chile`,
    format: 'json',
    limit: '5',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    signal,
    headers: NOMINATIM_HEADERS,
  });

  if (!res.ok) return [];
  return (await res.json()) as NominatimSearchResult[];
}
