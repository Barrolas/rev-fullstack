export const DESPACHO_WIZARD_STEPS = [
  'Incidente',
  'Resumen',
  'Composición',
  'Vehículos',
  'Confirmar',
] as const;

export type DespachoWizardStep = (typeof DESPACHO_WIZARD_STEPS)[number];
