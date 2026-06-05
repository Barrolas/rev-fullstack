import { useCallback, useEffect, useState } from 'react';
import type { BrigadaElegibilidad, BrigadaItem, RecursosCatalogo } from '../api';
import { fetchBrigadaDetalle, fetchBrigadaElegibilidad } from '../api';

export interface BrigadaResumenRow {
  brigadaId: number;
  elegibilidad: BrigadaElegibilidad | null;
  vehiculoPatentes: string;
  vehiculoCount: number;
}

export function useBrigadasResumen(catalogo: RecursosCatalogo | null) {
  const [resumenes, setResumenes] = useState<Record<number, BrigadaResumenRow>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (brigadas: BrigadaItem[]) => {
    if (brigadas.length === 0) {
      setResumenes({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await Promise.all(
        brigadas.map(async (b) => {
          const [elegibilidad, detalle] = await Promise.all([
            fetchBrigadaElegibilidad(b.id),
            fetchBrigadaDetalle(b.id),
          ]);
          const vehs = detalle.vehiculos ?? [];
          const patentes =
            vehs.length > 0
              ? vehs.map((v) => v.patente ?? String(v.vehiculoId)).join(', ')
              : detalle.vehiculo?.patente ?? '—';
          return {
            brigadaId: b.id,
            elegibilidad,
            vehiculoPatentes: patentes,
            vehiculoCount: vehs.length || (detalle.vehiculoId != null ? 1 : 0),
          } satisfies BrigadaResumenRow;
        }),
      );
      const map: Record<number, BrigadaResumenRow> = {};
      rows.forEach((r) => {
        map[r.brigadaId] = r;
      });
      setResumenes(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar resumen de brigadas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!catalogo?.brigadas.length) {
      setResumenes({});
      return;
    }
    load(catalogo.brigadas);
  }, [catalogo, load]);

  const brigadasListas = Object.values(resumenes).filter(
    (r) => r.elegibilidad?.listaParaDespacho,
  ).length;

  const refreshOne = useCallback(async (brigadaId: number) => {
    try {
      const [elegibilidad, detalle] = await Promise.all([
        fetchBrigadaElegibilidad(brigadaId),
        fetchBrigadaDetalle(brigadaId),
      ]);
      const vehs = detalle.vehiculos ?? [];
      const patentes =
        vehs.length > 0
          ? vehs.map((v) => v.patente ?? String(v.vehiculoId)).join(', ')
          : detalle.vehiculo?.patente ?? '—';
      setResumenes((prev) => ({
        ...prev,
        [brigadaId]: {
          brigadaId,
          elegibilidad,
          vehiculoPatentes: patentes,
          vehiculoCount: vehs.length || (detalle.vehiculoId != null ? 1 : 0),
        },
      }));
    } catch {
      /* ignore partial refresh */
    }
  }, []);

  return {
    resumenes,
    loading,
    error,
    brigadasListas,
    reload: () => catalogo && load(catalogo.brigadas),
    refreshOne,
  };
}
