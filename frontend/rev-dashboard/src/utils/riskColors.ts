/** Paleta REV para niveles de riesgo (mapa, badges, leyendas). */
export const RISK_COLORS = {
  high: {
    main: '#f97316',
    fill: 'rgba(249, 115, 22, 0.34)',
    stroke: '#f97316',
  },
  medium: {
    main: '#eab308',
    fill: 'rgba(234, 179, 8, 0.32)',
    stroke: '#ca8a04',
  },
  low: {
    main: '#73839a',
    fill: 'rgba(115, 131, 154, 0.22)',
    stroke: '#73839a',
  },
  unknown: {
    main: '#73839a',
    fill: 'rgba(115, 131, 154, 0.14)',
    stroke: '#5a6a7e',
  },
} as const;

export type RiskLevelKey = keyof typeof RISK_COLORS;
