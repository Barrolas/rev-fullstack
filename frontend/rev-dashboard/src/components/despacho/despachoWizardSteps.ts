export const DESPACHO_WIZARD_STEPS = [
  'Incidente',
  'Composición',
  'Confirmar',
] as const;

export type DespachoWizardStep = (typeof DESPACHO_WIZARD_STEPS)[number];
