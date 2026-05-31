import { Badge } from 'react-bootstrap';

interface RiskBadgeProps {
  nivel: string;
}

export function riskVariant(nivel: string): string {
  const n = nivel?.toUpperCase() ?? '';
  if (n.includes('HIGH') || n.includes('ALTO')) return 'high';
  if (n.includes('MEDIUM') || n.includes('MEDIO')) return 'medium';
  if (n.includes('LOW') || n.includes('BAJO')) return 'low';
  return 'unknown';
}

export default function RiskBadge({ nivel }: RiskBadgeProps) {
  const variant = riskVariant(nivel);
  const className = `badge-risk-${variant}`;
  return <Badge className={className}>{nivel}</Badge>;
}
