import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { RecursosDisponibles } from '../../api';
import {
  computeRecursosStats,
  filterBrigadas,
  filterHerramientas,
  filterVehiculos,
  formatRecursoEstado,
  herramientaStockLevel,
  recursoEstadoVariant,
  recursoStockLabel,
  type RecursosFiltersState,
} from '../../utils/recursosUtils';

interface RecursosSummaryRailProps {
  data: RecursosDisponibles;
  onFilterDisponibles: () => void;
  onFilterEnUso: () => void;
  onFilterStockBajo: () => void;
}

export function RecursosSummaryRail({
  data,
  onFilterDisponibles,
  onFilterEnUso,
  onFilterStockBajo,
}: RecursosSummaryRailProps) {
  const stats = computeRecursosStats(data);

  const bars = [
    {
      label: 'Brigadas',
      disp: stats.brigadasDisp,
      total: stats.brigadasTotal,
      pct: stats.brigadasTotal ? Math.round((stats.brigadasDisp / stats.brigadasTotal) * 100) : 0,
    },
    {
      label: 'Vehículos',
      disp: stats.vehiculosDisp,
      total: stats.vehiculosTotal,
      pct: stats.vehiculosTotal ? Math.round((stats.vehiculosDisp / stats.vehiculosTotal) * 100) : 0,
    },
    {
      label: 'Herramientas',
      disp: stats.herramientasDisp,
      total: stats.herramientasTotal,
      pct: stats.herramientasTotal ? Math.round((stats.herramientasDisp / stats.herramientasTotal) * 100) : 0,
    },
  ];

  return (
    <div className="rev-recursos-rail">
      <header className="rev-recursos-rail__head">
        <h3 className="rev-recursos-rail__title">Disponibilidad</h3>
        <span className="rev-recursos-rail__meta">
          {stats.disponiblesTotal} libres · {stats.enUsoTotal} en uso
        </span>
      </header>

      <div className="rev-recursos-rail__bars">
        {bars.map(({ label, disp, total, pct }) => (
          <div key={label} className="rev-recursos-rail__bar-row">
            <span className="rev-recursos-rail__bar-label">{label}</span>
            <span className="rev-recursos-rail__bar-track">
              <span className="rev-recursos-rail__bar-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="rev-recursos-rail__bar-count">{disp}/{total}</span>
          </div>
        ))}
      </div>

      <div className="rev-recursos-rail__shortcuts">
        <button type="button" className="rev-recursos-rail__shortcut" onClick={onFilterDisponibles}>
          <i className="bi bi-check2-circle" aria-hidden="true" />
          Solo disponibles
        </button>
        <button type="button" className="rev-recursos-rail__shortcut" onClick={onFilterEnUso}>
          <i className="bi bi-lightning" aria-hidden="true" />
          En uso ({stats.enUsoTotal})
        </button>
        {stats.herramientasBajas > 0 && (
          <button
            type="button"
            className="rev-recursos-rail__shortcut rev-recursos-rail__shortcut--warn"
            onClick={onFilterStockBajo}
          >
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            Stock bajo ({stats.herramientasBajas})
          </button>
        )}
        <Link to="/incidentes" className="rev-recursos-rail__link">
          <i className="bi bi-fire" aria-hidden="true" />
          Ver incidentes activos
        </Link>
      </div>
    </div>
  );
}

interface RecursosTablesProps {
  data: RecursosDisponibles;
  filters: RecursosFiltersState;
  activeTab: 'brigadas' | 'vehiculos' | 'herramientas';
  onTabChange: (tab: 'brigadas' | 'vehiculos' | 'herramientas') => void;
}

const TABS = [
  { id: 'brigadas' as const, label: 'Brigadas', icon: 'bi-people' },
  { id: 'vehiculos' as const, label: 'Vehículos', icon: 'bi-truck' },
  { id: 'herramientas' as const, label: 'Herramientas', icon: 'bi-tools' },
];

export function RecursosTables({ data, filters, activeTab, onTabChange }: RecursosTablesProps) {
  const brigadas = filterBrigadas(data.brigadas, filters);
  const vehiculos = filterVehiculos(data.vehiculos, filters);
  const herramientas = filterHerramientas(data.herramientas, filters);

  const counts = {
    brigadas: brigadas.length,
    vehiculos: vehiculos.length,
    herramientas: herramientas.length,
  };

  return (
    <div className="rev-recursos-tables">
      <div className="rev-recursos-tabs" role="tablist" aria-label="Categorías de recursos">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={`rev-recursos-tabs__btn${activeTab === id ? ' rev-recursos-tabs__btn--active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <i className={`bi ${icon}`} aria-hidden="true" />
            {label}
            <span className="rev-recursos-tabs__count">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="rev-recursos-panels">
        <div className={`rev-recursos-panel${activeTab === 'brigadas' ? ' rev-recursos-panel--active' : ''}`}>
          <div className="rev-data-table-wrap">
            <table className="rev-data-table rev-data-table--compact rev-recursos-table">
              <thead>
                <tr>
                  <th scope="col">Brigada</th>
                  <th scope="col">Cap.</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {brigadas.map((b) => (
                  <tr key={b.id} className={b.estado === 'ASIGNADO' ? 'rev-recursos-table__row--assigned' : ''}>
                    <td><span className="rev-recursos-table__name">{b.nombre}</span></td>
                    <td><span className="rev-recursos-table__num">{b.capacidad}</span></td>
                    <td>
                      <Badge bg={recursoEstadoVariant(b.estado)} className="rev-recursos-table__badge">
                        {formatRecursoEstado(b.estado)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`rev-recursos-panel${activeTab === 'vehiculos' ? ' rev-recursos-panel--active' : ''}`}>
          <div className="rev-data-table-wrap">
            <table className="rev-data-table rev-data-table--compact rev-recursos-table">
              <thead>
                <tr>
                  <th scope="col">Patente</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((v) => (
                  <tr key={v.id} className={v.estado === 'ASIGNADO' ? 'rev-recursos-table__row--assigned' : ''}>
                    <td><span className="rev-recursos-table__name">{v.patente}</span></td>
                    <td>{v.tipo}</td>
                    <td>
                      <Badge bg={recursoEstadoVariant(v.estado)} className="rev-recursos-table__badge">
                        {formatRecursoEstado(v.estado)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`rev-recursos-panel${activeTab === 'herramientas' ? ' rev-recursos-panel--active' : ''}`}>
          <div className="rev-data-table-wrap">
            <table className="rev-data-table rev-data-table--compact rev-recursos-table">
              <thead>
                <tr>
                  <th scope="col">Herramienta</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {herramientas.map((h) => {
                  const level = herramientaStockLevel(h.cantidadDisponible, h.cantidadTotal);
                  const pct = h.cantidadTotal > 0
                    ? Math.round((h.cantidadDisponible / h.cantidadTotal) * 100)
                    : 0;
                  return (
                    <tr key={h.id} className={`rev-recursos-table__row--stock-${level}`}>
                      <td><span className="rev-recursos-table__name">{h.nombre}</span></td>
                      <td>
                        <div className="rev-recursos-stock">
                          <span className="rev-recursos-stock__nums">
                            {h.cantidadDisponible}/{h.cantidadTotal}
                          </span>
                          <span className="rev-recursos-stock__track">
                            <span
                              className={`rev-recursos-stock__fill rev-recursos-stock__fill--${level}`}
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`rev-recursos-stock-badge rev-recursos-stock-badge--${level}`}>
                          {recursoStockLabel(level)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecursosDesktopGridProps {
  data: RecursosDisponibles;
  filters: RecursosFiltersState;
}

export function RecursosDesktopGrid({ data, filters }: RecursosDesktopGridProps) {
  const brigadas = filterBrigadas(data.brigadas, filters);
  const vehiculos = filterVehiculos(data.vehiculos, filters);
  const herramientas = filterHerramientas(data.herramientas, filters);

  return (
    <div className="rev-recursos-grid">
      <section className="rev-recursos-grid__section rev-card">
        <h3 className="rev-recursos-grid__title">
          <i className="bi bi-people" aria-hidden="true" /> Brigadas
          <Badge bg="secondary">{brigadas.length}</Badge>
        </h3>
        <div className="rev-data-table-wrap">
          <table className="rev-data-table rev-data-table--compact rev-recursos-table">
            <thead>
              <tr><th scope="col">Nombre</th><th scope="col">Cap.</th><th scope="col">Estado</th></tr>
            </thead>
            <tbody>
              {brigadas.map((b) => (
                <tr key={b.id} className={b.estado === 'ASIGNADO' ? 'rev-recursos-table__row--assigned' : ''}>
                  <td><span className="rev-recursos-table__name">{b.nombre}</span></td>
                  <td><span className="rev-recursos-table__num">{b.capacidad}</span></td>
                  <td>
                    <Badge bg={recursoEstadoVariant(b.estado)} className="rev-recursos-table__badge">
                      {formatRecursoEstado(b.estado)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rev-recursos-grid__section rev-card">
        <h3 className="rev-recursos-grid__title">
          <i className="bi bi-truck" aria-hidden="true" /> Vehículos
          <Badge bg="secondary">{vehiculos.length}</Badge>
        </h3>
        <div className="rev-data-table-wrap">
          <table className="rev-data-table rev-data-table--compact rev-recursos-table">
            <thead>
              <tr><th scope="col">Patente</th><th scope="col">Tipo</th><th scope="col">Estado</th></tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id} className={v.estado === 'ASIGNADO' ? 'rev-recursos-table__row--assigned' : ''}>
                  <td><span className="rev-recursos-table__name">{v.patente}</span></td>
                  <td>{v.tipo}</td>
                  <td>
                    <Badge bg={recursoEstadoVariant(v.estado)} className="rev-recursos-table__badge">
                      {formatRecursoEstado(v.estado)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rev-recursos-grid__section rev-card rev-recursos-grid__section--wide">
        <h3 className="rev-recursos-grid__title">
          <i className="bi bi-tools" aria-hidden="true" /> Herramientas
          <Badge bg="secondary">{herramientas.length}</Badge>
        </h3>
        <div className="rev-data-table-wrap">
          <table className="rev-data-table rev-data-table--compact rev-recursos-table">
            <thead>
              <tr><th scope="col">Nombre</th><th scope="col">Stock</th><th scope="col">Nivel</th></tr>
            </thead>
            <tbody>
              {herramientas.map((h) => {
                const level = herramientaStockLevel(h.cantidadDisponible, h.cantidadTotal);
                const pct = h.cantidadTotal > 0
                  ? Math.round((h.cantidadDisponible / h.cantidadTotal) * 100)
                  : 0;
                return (
                  <tr key={h.id} className={`rev-recursos-table__row--stock-${level}`}>
                    <td><span className="rev-recursos-table__name">{h.nombre}</span></td>
                    <td>
                      <div className="rev-recursos-stock">
                        <span className="rev-recursos-stock__nums">
                          {h.cantidadDisponible}/{h.cantidadTotal}
                        </span>
                        <span className="rev-recursos-stock__track">
                          <span
                            className={`rev-recursos-stock__fill rev-recursos-stock__fill--${level}`}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`rev-recursos-stock-badge rev-recursos-stock-badge--${level}`}>
                        {recursoStockLabel(level)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
