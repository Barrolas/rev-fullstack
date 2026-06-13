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

export function resolveVehiculos(draft: DespachoBrigadaDraft) {
  if (draft.detalle.vehiculos?.length) return draft.detalle.vehiculos;
  if (draft.detalle.vehiculo) {
    const vehiculoId = draft.detalle.vehiculoId ?? draft.detalle.vehiculo.id;
    return [
      {
        id: vehiculoId,
        vehiculoId,
        patente: draft.detalle.vehiculo.patente,
        tipo: draft.detalle.vehiculo.tipo,
        capacidadPasajeros: draft.detalle.vehiculo.capacidadPasajeros,
        principal: true,
        activa: true,
      },
    ];
  }
  return [];
}

/** Suma plazas de todos los vehículos marcados en la composición. */
export function selectedVehiclesCapacity(draft: DespachoBrigadaDraft): number {
  return resolveVehiculos(draft)
    .filter((v) => draft.vehiculoIds.has(v.vehiculoId))
    .reduce((sum, v) => sum + (v.capacidadPasajeros ?? 0), 0);
}

/** Mensaje de error si la composición no puede despacharse; null si está OK. */
export function validateDraftForDespacho(draft: DespachoBrigadaDraft): string | null {
  if (draft.brigadistaIds.size === 0) {
    return `${draft.nombre}: seleccione al menos un integrante.`;
  }
  if (draft.vehiculoIds.size === 0) {
    return `${draft.nombre}: seleccione al menos un vehículo.`;
  }
  if (draft.principalVehiculoId == null || !draft.vehiculoIds.has(draft.principalVehiculoId)) {
    return `${draft.nombre}: indique el vehículo prioritario de salida.`;
  }
  const plazasTotales = selectedVehiclesCapacity(draft);
  if (plazasTotales > 0 && draft.brigadistaIds.size > plazasTotales) {
    return `${draft.nombre}: integrantes (${draft.brigadistaIds.size}) superan plazas de los vehículos seleccionados (${plazasTotales}).`;
  }
  return null;
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
