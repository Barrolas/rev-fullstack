import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import AltaBrigadaWizard from './alta/AltaBrigadaWizard';
import AltaBrigadistaWizard from './alta/AltaBrigadistaWizard';
import AltaHerramientaWizard from './alta/AltaHerramientaWizard';
import AltaVehiculoWizard from './alta/AltaVehiculoWizard';

export type RecursoAltaTipo = 'brigadista' | 'vehiculo' | 'herramienta' | 'brigada' | null;

const ACCIONES = [
  {
    id: 'brigadista' as const,
    title: 'Brigadista',
    desc: 'Personal disponible para dotar en brigadas.',
    icon: 'bi-person-badge',
    accent: 'cyan',
  },
  {
    id: 'vehiculo' as const,
    title: 'Vehículo',
    desc: 'Patente, ficha técnica y capacidades operativas.',
    icon: 'bi-truck',
    accent: 'orange',
  },
  {
    id: 'herramienta' as const,
    title: 'Herramienta / stock',
    desc: 'Artículos e inventario para kits de brigada.',
    icon: 'bi-tools',
    accent: 'yellow',
  },
  {
    id: 'brigada' as const,
    title: 'Brigada',
    desc: 'Unidad operativa con cupo y organización.',
    icon: 'bi-people',
    accent: 'primary',
  },
];

interface RecursosAltaHubProps {
  onRefresh: () => void;
  counts?: {
    brigadistas: number;
    vehiculos: number;
    herramientas: number;
    brigadas: number;
  };
}

export default function RecursosAltaHub({ onRefresh, counts }: RecursosAltaHubProps) {
  const [alta, setAlta] = useState<RecursoAltaTipo>(null);
  const [altaError, setAltaError] = useState<string | null>(null);

  const openAlta = (tipo: RecursoAltaTipo) => {
    setAltaError(null);
    setAlta(tipo);
  };

  const countFor = (id: RecursoAltaTipo) => {
    if (!counts || !id) return null;
    const map = {
      brigadista: counts.brigadistas,
      vehiculo: counts.vehiculos,
      herramienta: counts.herramientas,
      brigada: counts.brigadas,
    };
    return map[id];
  };

  const handleSaved = () => {
    onRefresh();
    setAlta(null);
  };

  return (
    <section className="rev-recursos-admin__section mb-4">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div>
          <h2 className="h6 rev-recursos-admin__heading mb-1">Agregar recurso</h2>
          <p className="small text-muted mb-0">
            Asistentes guiados con recomendaciones. Luego incorpore los activos en la dotación de
            cada brigada.
          </p>
        </div>
      </div>

      <div className="rev-alta-hub">
        {ACCIONES.map((a) => {
          const total = countFor(a.id);
          return (
            <button
              key={a.id}
              type="button"
              className={`rev-alta-hub__card rev-alta-hub__card--${a.accent}`}
              onClick={() => openAlta(a.id)}
            >
              <i className={`bi ${a.icon} rev-alta-hub__icon`} aria-hidden="true" />
              <span className="rev-alta-hub__title">{a.title}</span>
              <span className="rev-alta-hub__desc">{a.desc}</span>
              {total != null && (
                <span className="rev-alta-hub__count">{total} en catálogo</span>
              )}
              <span className="rev-alta-hub__cta">
                Abrir asistente <i className="bi bi-arrow-right" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      {altaError && (
        <Alert variant="danger" dismissible className="mt-3 mb-0" onClose={() => setAltaError(null)}>
          {altaError}
        </Alert>
      )}

      <AltaBrigadistaWizard
        show={alta === 'brigadista'}
        onHide={() => setAlta(null)}
        onSaved={handleSaved}
        onAltaError={setAltaError}
      />
      <AltaVehiculoWizard
        show={alta === 'vehiculo'}
        onHide={() => setAlta(null)}
        onSaved={handleSaved}
        onAltaError={setAltaError}
      />
      <AltaHerramientaWizard
        show={alta === 'herramienta'}
        onHide={() => setAlta(null)}
        onSaved={handleSaved}
        onAltaError={setAltaError}
      />
      <AltaBrigadaWizard
        show={alta === 'brigada'}
        onHide={() => setAlta(null)}
        onSaved={handleSaved}
        onAltaError={setAltaError}
      />
    </section>
  );
}
