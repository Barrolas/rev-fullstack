export type RecursosModuleView = 'inventario' | 'administracion';

interface RecursosModuleTabsProps {
  active: RecursosModuleView;
  onChange: (view: RecursosModuleView) => void;
}

export default function RecursosModuleTabs({ active, onChange }: RecursosModuleTabsProps) {
  return (
    <div className="rev-recursos-module-tabs" role="tablist" aria-label="Vistas del módulo recursos">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'inventario'}
        className={`rev-recursos-module-tabs__btn${active === 'inventario' ? ' rev-recursos-module-tabs__btn--active' : ''}`}
        onClick={() => onChange('inventario')}
      >
        <i className="bi bi-grid me-1" aria-hidden="true" />
        Consulta
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'administracion'}
        className={`rev-recursos-module-tabs__btn${active === 'administracion' ? ' rev-recursos-module-tabs__btn--active' : ''}`}
        onClick={() => onChange('administracion')}
      >
        <i className="bi bi-gear me-1" aria-hidden="true" />
        Gestión y dotación
      </button>
    </div>
  );
}
