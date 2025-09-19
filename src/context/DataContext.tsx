import React, { createContext, useContext, useMemo, useState } from "react";

// 1) Define el tipo de datos que compartirás por contexto
type DataCtx = {
  proyectos: any[];
  setProyectos: React.Dispatch<React.SetStateAction<any[]>>;
  // agrega aquí lo que realmente uses en tus componentes
};

// 2) Crea el contexto (arranca como null para detectar mal uso)
const DataContext = createContext<DataCtx | null>(null);

// 3) Provider mínimo: puedes cargar Firestore acá si quieres
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [proyectos, setProyectos] = useState<any[]>([]);

  const value = useMemo(
    () => ({ proyectos, setProyectos }),
    [proyectos]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// 4) Hook de acceso: lanza error si está “fuera de alcance”
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("DataContext fuera de alcance");
  }
  return ctx;
}
