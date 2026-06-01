import { REV_GEO } from '../../branding';
import { useWeather } from '../../hooks/useWeather';

interface WeatherChipProps {
  compact?: boolean;
  className?: string;
}

export default function WeatherChip({ compact = false, className = '' }: WeatherChipProps) {
  const { weather, loading, error } = useWeather();

  if (error) return null;

  const rootClass = [
    'rev-weather-chip',
    compact ? 'rev-weather-chip--compact' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rootClass}
      title={`Clima en ${REV_GEO.label} · Open-Meteo`}
      aria-label="Condiciones climáticas locales"
    >
      {loading || !weather ? (
        <span className="rev-weather-chip__loading">Clima…</span>
      ) : (
        <>
          <i className={`bi ${weather.icon} rev-weather-chip__icon`} aria-hidden="true" />
          <span className="rev-weather-chip__temp">{weather.temperature}°</span>
          {!compact && (
            <>
              <span className="rev-weather-chip__sep" aria-hidden="true">·</span>
              <span className="rev-weather-chip__meta">{weather.description}</span>
              <span className="rev-weather-chip__detail">
                {weather.humidity}% · {weather.windKmh} km/h
              </span>
            </>
          )}
        </>
      )}
    </div>
  );
}
