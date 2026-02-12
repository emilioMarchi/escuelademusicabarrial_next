"use client";
import React, { createContext, useContext, useState } from "react";

interface DirtyContextType {
  isDirty: boolean;
  setDirty: (value: boolean) => void;
}

const DirtyContext = createContext<DirtyContextType | undefined>(undefined);

export function DirtyStateProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setDirty] = useState(false);

  // Se elimina el listener de 'beforeunload' para evitar que el navegador 
  // dispare su alerta nativa al recargar o cerrar la pestaña.
  
  return (
    <DirtyContext.Provider value={{ isDirty, setDirty }}>
      {children}
    </DirtyContext.Provider>
  );
}

export const useDirtyState = () => {
  const context = useContext(DirtyContext);
  if (!context) throw new Error("useDirtyState debe usarse dentro de DirtyStateProvider");
  return context;
};