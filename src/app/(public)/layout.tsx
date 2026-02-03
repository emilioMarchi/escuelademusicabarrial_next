// src/app/(public)/layout.tsx
import React from "react";
import Navbar from "@/components/navbar/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Este ya es dinámico, responsive y trae los links de la DB. 
          No hace falta nada más arriba.
      */}
      <Navbar />

      {/* Contenido Dinámico */}
      <main className="w-full min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50">
        <div className="container mx-auto py-8 px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Escuela de Música Barrial. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}