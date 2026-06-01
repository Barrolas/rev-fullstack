import { useEffect, useState } from 'react';
import { REV_GEO } from '../branding';

export interface WeatherSnapshot {
  temperature: number;
  humidity: number;
  windKmh: number;
  description: string;
  icon: string;
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

const REFRESH_MS = 15 * 60 * 1000;

function weatherFromCode(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Despejado', icon: 'bi-sun' };
  if (code <= 3) return { description: 'Parcialmente nublado', icon: 'bi-cloud-sun' };
  if (code <= 48) return { description: 'Niebla', icon: 'bi-cloud-fog' };
  if (code <= 67) return { description: 'Lluvia', icon: 'bi-cloud-rain' };
  if (code <= 77) return { description: 'Nieve', icon: 'bi-snow' };
  if (code <= 82) return { description: 'Chubascos', icon: 'bi-cloud-rain-heavy' };
  return { description: 'Tormenta', icon: 'bi-cloud-lightning-rain' };
}

export function useWeather(enabled = true) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      try {
        const params = new URLSearchParams({
          latitude: String(REV_GEO.lat),
          longitude: String(REV_GEO.lng),
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
          timezone: 'America/Santiago',
          wind_speed_unit: 'kmh',
        });
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error('weather fetch failed');
        const json = await res.json();
        const current = json.current as OpenMeteoCurrent;
        const meta = weatherFromCode(current.weather_code);
        if (!cancelled) {
          setWeather({
            temperature: Math.round(current.temperature_2m),
            humidity: current.relative_humidity_2m,
            windKmh: Math.round(current.wind_speed_10m),
            description: meta.description,
            icon: meta.icon,
          });
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setWeather(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled]);

  return { weather, loading, error };
}
