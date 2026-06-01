import InicioSectionHead from './InicioSectionHead';

const STEPS = [
  {
    title: 'Revise el despacho',
    desc: 'Al iniciar turno, confirme cuántas emergencias hay activas y si hay avisos pendientes.',
  },
  {
    title: 'Priorice lo urgente',
    desc: 'Atienda primero los casos en zonas de alto riesgo o con información incompleta.',
  },
  {
    title: 'Confirme en el mapa',
    desc: 'Verifique la zona del incidente antes de enviar brigadas o vehículos.',
  },
  {
    title: 'Mantenga la vista al día',
    desc: 'Actualice el panel cada pocos minutos durante el turno para no perder novedades.',
  },
] as const;

export default function InicioGuide() {
  return (
    <section className="rev-inicio__panel rev-card" aria-label="Guía del turno">
      <InicioSectionHead
        eyebrow="Su turno"
        title="Guía del despachador"
        desc="Pasos simples para una jornada ordenada"
        compact
      />
      <ol className="rev-inicio__protocol">
        {STEPS.map(({ title, desc }, index) => (
          <li key={title} className="rev-inicio__protocol-step">
            <span className="rev-inicio__protocol-num" aria-hidden="true">
              {index + 1}
            </span>
            <div className="rev-inicio__protocol-copy">
              <span className="rev-inicio__protocol-title">{title}</span>
              <span className="rev-inicio__protocol-desc">{desc}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
