import { asignarDespachoLote, fetchBrigadaDetalle } from '../api';
import {
  draftToAsignarItem,
  loadDraftsForBrigadas,
  validateDraftForDespacho,
} from './despachoWizardState';

export async function ejecutarDespachoRapido(
  incidenteId: string,
  brigadaIds: number[],
  despachadoPor: string,
) {
  const drafts = await loadDraftsForBrigadas(brigadaIds, fetchBrigadaDetalle);
  const validation = drafts.map(validateDraftForDespacho).find((msg) => msg != null);
  if (validation) {
    throw new Error(validation);
  }
  return asignarDespachoLote({
    incidenteId,
    despachadoPor,
    items: drafts.map(draftToAsignarItem),
  });
}
