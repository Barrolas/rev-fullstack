export type ZonasModuleView = 'mapa' | 'administracion';

interface ZonasModuleTabsProps {
  active: ZonasModuleView;
  onChange: (view: ZonasModuleView) => void;
}

export default function ZonasModuleTabs({ active, onChange }: ZonasModuleTabsProps) {
  return (
    <div className="rev-recursos-module-tabs" role="tablist" aria-label="Vistas del módulo zonas">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'mapa'}
        className={`rev-recursos-module-tabs__btn${active === 'mapa' ? ' rev-recursos-module-tabs__btn--active' : ''}`}
        onClick={() => onChange('mapa')}
      >
        <i className="bi bi-map me-1" aria-hidden="true" />
        Mapa territorial
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'administracion'}
        className={`rev-recursos-module-tabs__btn${active === 'administracion' ? ' rev-recursos-module-tabs__btn--active' : ''}`}
        onClick={() => onChange('administracion')}
      >
        <i className="bi bi-gear me-1" aria-hidden="true" />
        Administración de zonas
      </button>
    </div>
  );
}
