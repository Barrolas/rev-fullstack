interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  iconVariant?: 'default' | 'cyan' | 'warning';
}

export default function KpiCard({ label, value, sub, icon, iconVariant = 'default' }: KpiCardProps) {
  const iconClass =
    iconVariant === 'cyan'
      ? 'rev-kpi-card__icon rev-kpi-card__icon--cyan'
      : iconVariant === 'warning'
        ? 'rev-kpi-card__icon rev-kpi-card__icon--warning'
        : 'rev-kpi-card__icon';

  return (
    <div className="rev-kpi-card">
      {icon && (
        <div className={iconClass}>
          <i className={`bi ${icon}`} aria-hidden="true" />
        </div>
      )}
      <div className="rev-kpi-card__content">
        <div className="rev-kpi-card__label">{label}</div>
        <div className="rev-kpi-card__value">{value}</div>
        {sub && <div className="rev-kpi-card__sub">{sub}</div>}
      </div>
    </div>
  );
}
