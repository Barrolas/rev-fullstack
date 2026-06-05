/** Glosario y etiquetas del módulo Recursos (alineado con flujo-despacho-rev.md). */

export const RECURSOS_FLUJO_CADENA =
  'Institución → Compañía → Brigada → Dotación → Despacho';

export const DOTACION_WIZARD_STEPS = [
  'Resumen',
  'Personal',
  'Vehículos de dotación',
  'Kit operativo',
  'Lista para despacho',
] as const;

export const RECURSOS_GLOSARIO: Record<string, string> = {
  dotacion:
    'Asignación de jefe, integrantes, vehículos y kit a una brigada para operación.',
  cupoMaximo: 'Número máximo de integrantes que puede tener la brigada.',
  listaDespacho:
    'Cumple reglas operativas: jefe válido, integrantes dentro del cupo, vehículo activo y recursos disponibles.',
  disponible:
    'Recurso libre (estado DISPONIBLE). No implica por sí solo lista para despacho.',
  asignado: 'Recurso o brigada vinculada a un incidente activo.',
};

export function labelListaDespacho(lista: boolean): string {
  return lista ? 'Lista' : 'Incompleta';
}

export function labelEstadoOperacion(estado: string): string {
  if (estado === 'ASIGNADO') return 'En incidente';
  if (estado === 'DISPONIBLE') return 'Disponible';
  return estado.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function semaforoClass(lista: boolean): string {
  return lista ? 'rev-recursos-semaforo--ok' : 'rev-recursos-semaforo--warn';
}
