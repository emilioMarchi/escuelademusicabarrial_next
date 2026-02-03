"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface DirtyContextType {
  isDirty: boolean;
  setDirty: (value: boolean) => void;
}

const DirtyContext = createContext<DirtyContextType | undefined>(undefined);

export function DirtyStateProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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