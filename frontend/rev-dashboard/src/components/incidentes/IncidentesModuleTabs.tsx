export type IncidentesModuleView = 'listado' | 'correlaciones';

interface IncidentesModuleTabsProps {
  active: IncidentesModuleView;
  correlacionesCount: number;
  onChange: (view: IncidentesModuleView) => void;
}

export default function IncidentesModuleTabs({
  active,
  correlacionesCount,
  onChange,
}: IncidentesModuleTabsProps) {
  return (
    <div className="rev-incidentes-module-tabs" role="tablist" aria-label="Vistas del módulo incidentes">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'listado'}
        className={`rev-incidentes-module-tabs__btn${active === 'listado' ? ' rev-incidentes-module-tabs__btn--active' : ''}`}
        onClick={() => onChange('listado')}
      >
        <i className="bi bi-grid me-1" aria-hidden="true" />
        Listado
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'correlaciones'}
        className={`rev-incidentes-module-tabs__btn${active === 'correlaciones' ? ' rev-incidentes-module-tabs__btn--active' : ''}`}
        onClick={() => onChange('correlaciones')}
      >
        <i className="bi bi-intersect me-1" aria-hidden="true" />
        Correlaciones
        {correlacionesCount > 0 && (
          <span className="rev-incidentes-module-tabs__badge">{correlacionesCount}</span>
        )}
      </button>
    </div>
  );
}
