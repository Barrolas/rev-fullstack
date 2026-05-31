import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface UiContextValue {
  incidentModalOpen: boolean;
  openIncidentModal: () => void;
  closeIncidentModal: () => void;
  incidentCreatedTick: number;
  notifyIncidentCreated: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentCreatedTick, setIncidentCreatedTick] = useState(0);

  const openIncidentModal = useCallback(() => setIncidentModalOpen(true), []);
  const closeIncidentModal = useCallback(() => setIncidentModalOpen(false), []);
  const notifyIncidentCreated = useCallback(() => setIncidentCreatedTick((t) => t + 1), []);

  const value = useMemo(
    () => ({
      incidentModalOpen,
      openIncidentModal,
      closeIncidentModal,
      incidentCreatedTick,
      notifyIncidentCreated,
    }),
    [incidentModalOpen, openIncidentModal, closeIncidentModal, incidentCreatedTick, notifyIncidentCreated],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi debe usarse dentro de UiProvider');
  return ctx;
}
