/** Presets y recomendaciones para wizards de alta de recursos. */

export const ESPECIALIDADES_SUGERIDAS = [
  'Combate forestal',
  'Primeros auxilios',
  'Conducción operativa',
  'Logística y apoyo',
  'Comunicaciones',
  'Líder de cuadrilla',
] as const;

export const HERRAMIENTAS_SUGERIDAS = [
  { nombre: 'Manguera forestal', stockSugerido: 4 },
  { nombre: 'Hacha pulaski', stockSugerido: 6 },
  { nombre: 'EPI respiratorio', stockSugerido: 12 },
  { nombre: 'Extintor PQS 6 kg', stockSugerido: 8 },
  { nombre: 'Kit primeros auxilios', stockSugerido: 4 },
  { nombre: 'Radio portátil', stockSugerido: 6 },
] as const;

export const VEHICULO_TIPOS = [
  {
    id: 'CAMIONETA',
    label: 'Camioneta',
    icon: 'bi-truck',
    desc: 'Dotación rápida y traslado de cuadrilla.',
    pasajeros: 5,
    carga: 500,
  },
  {
    id: 'CISTERNA',
    label: 'Cisterna',
    icon: 'bi-droplet-half',
    desc: 'Abastecimiento de agua en terreno.',
    pasajeros: 3,
    carga: 8000,
  },
  {
    id: 'AMBULANCIA',
    label: 'Ambulancia',
    icon: 'bi-heart-pulse',
    desc: 'Evacuación y apoyo médico.',
    pasajeros: 4,
    carga: 200,
  },
  {
    id: 'CAMION',
    label: 'Camión',
    icon: 'bi-truck-front',
    desc: 'Refuerzo logístico y material pesado.',
    pasajeros: 3,
    carga: 12000,
  },
  {
    id: 'MOTO',
    label: 'Motocicleta',
    icon: 'bi-bicycle',
    desc: 'Reconocimiento en accesos difíciles.',
    pasajeros: 2,
    carga: 20,
  },
  {
    id: 'OTRO',
    label: 'Otro',
    icon: 'bi-gear',
    desc: 'Tipo personalizado; complete capacidades manualmente.',
    pasajeros: 4,
    carga: 0,
  },
] as const;

export const BRIGADA_CUPO_PRESETS = [
  { label: 'Rápida', capacidad: 4, desc: '4 integrantes — respuesta inmediata.' },
  { label: 'Estándar', capacidad: 8, desc: '8 integrantes — dotación habitual.' },
  { label: 'Refuerzo', capacidad: 12, desc: '12 integrantes — operaciones extendidas.' },
] as const;

export function vehiculoTipoPreset(tipo: string) {
  return VEHICULO_TIPOS.find((t) => t.id === tipo) ?? VEHICULO_TIPOS.find((t) => t.id === 'OTRO')!;
}
