import React from "react";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Contenedor principal: Ocupa toda la pantalla y NO tiene scroll global
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Sidebar: Altura completa, ancho fijo, no se encoge */}
      <Sidebar />
      
      {/* Área de Contenido: Toma el espacio restante y SÍ tiene scroll interno */}
      <main className="flex-1 h-full overflow-y-auto scroll-smooth">
        <div className="p-8 md:p-12 max-w-6xl mx-auto pb-32">
          {children}
        </div>
      </main>
      
    </div>
  );
}