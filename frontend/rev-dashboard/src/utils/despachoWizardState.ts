import type { BrigadaDetalle } from '../api';

export interface DespachoBrigadaDraft {
  brigadaId: number;
  nombre: string;
  listaParaDespacho: boolean;
  detalle: BrigadaDetalle;
  brigadistaIds: Set<number>;
  vehiculoIds: Set<number>;
  principalVehiculoId: number | null;
  herramientas: Map<number, number>;
}

export function createDraftFromDetalle(detalle: BrigadaDetalle): DespachoBrigadaDraft {
  const brigadistaIds = new Set(detalle.brigadistas.map((b) => b.id));
  const vehiculoIds = new Set<number>();
  if (detalle.vehiculos?.length) {
    detalle.vehiculos.forEach((v) => vehiculoIds.add(v.vehiculoId));
  } else if (detalle.vehiculoId != null) {
    vehiculoIds.add(detalle.vehiculoId);
  }
  const principal =
    detalle.vehiculos?.find((v) => v.principal)?.vehiculoId ??
    detalle.vehiculoId ??
    (vehiculoIds.size ? [...vehiculoIds][0] : null);

  const herramientas = new Map<number, number>();
  detalle.herramientas.forEach((h) => herramientas.set(h.herramientaId, h.cantidad));

  return {
    brigadaId: detalle.id,
    nombre: detalle.nombre,
    listaParaDespacho: detalle.listaParaDespacho,
    detalle,
    brigadistaIds,
    vehiculoIds,
    principalVehiculoId: principal,
    herramientas,
  };
}

export function draftToAsignarItem(draft: DespachoBrigadaDraft) {
  return {
    brigadaId: draft.brigadaId,
    vehiculoId: draft.principalVehiculoId ?? undefined,
    principalVehiculoId: draft.principalVehiculoId ?? undefined,
    vehiculoIds: [...draft.vehiculoIds],
    brigadistaIds: [...draft.brigadistaIds],
    herramientas: [...draft.herramientas.entries()].map(([herramientaId, cantidad]) => ({
      herramientaId,
      cantidad,
    })),
    usarComposicionBrigada: true,
  };
}

export async function loadDraftsForBrigadas(
  brigadaIds: number[],
  fetchDetalle: (id: number) => Promise<BrigadaDetalle>,
): Promise<DespachoBrigadaDraft[]> {
  const detalles = await Promise.all(brigadaIds.map(fetchDetalle));
  return detalles.map(createDraftFromDetalle);
}
