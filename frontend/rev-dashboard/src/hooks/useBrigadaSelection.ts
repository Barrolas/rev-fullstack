import { useCallback, useMemo, useState } from 'react';

export interface BrigadaSelectableRow {
  id: number;
  estado: string;
  listaParaDespacho?: boolean;
}

export interface UseBrigadaSelectionOptions {
  rows: BrigadaSelectableRow[];
  /** Si false, la brigada no puede marcarse (ej. ASIGNADO o sin dotación). */
  isRowSelectable?: (row: BrigadaSelectableRow) => boolean;
}

export function useBrigadaSelection({ rows, isRowSelectable }: UseBrigadaSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const defaultSelectable = useCallback(
    (row: BrigadaSelectableRow) =>
      row.estado === 'DISPONIBLE' && (row.listaParaDespacho ?? true),
    [],
  );

  const canSelect = isRowSelectable ?? defaultSelectable;

  const selectableRows = useMemo(
    () => rows.filter(canSelect),
    [rows, canSelect],
  );

  const selectableIds = useMemo(
    () => new Set(selectableRows.map((r) => r.id)),
    [selectableRows],
  );

  const toggle = useCallback(
    (id: number) => {
      const row = rows.find((r) => r.id === id);
      if (!row || !canSelect(row)) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [rows, canSelect],
  );

  const selectAllVisible = useCallback(() => {
    setSelectedIds(new Set(selectableRows.map((r) => r.id)));
  }, [selectableRows]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const allVisibleSelected =
    selectableRows.length > 0 && selectableRows.every((r) => selectedIds.has(r.id));

  const toggleSelectAllVisible = useCallback(() => {
    if (allVisibleSelected) clear();
    else selectAllVisible();
  }, [allVisibleSelected, clear, selectAllVisible]);

  const selectedArray = useMemo(() => [...selectedIds], [selectedIds]);

  return {
    selectedIds,
    selectedArray,
    count: selectedIds.size,
    toggle,
    clear,
    selectAllVisible,
    toggleSelectAllVisible,
    allVisibleSelected,
    canSelect,
    selectableRows,
    isSelected: (id: number) => selectedIds.has(id),
  };
}
