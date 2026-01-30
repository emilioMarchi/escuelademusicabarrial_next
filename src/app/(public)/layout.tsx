// src/app/(public)/layout.tsx
import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="font-bold text-xl">EMB</div>
          <nav className="hidden md:flex gap-6">
            {/* Aquí luego usaremos un mapeo de categorías */}
            <a href="/" className="text-sm font-medium">Inicio</a>
            <a href="/nosotros" className="text-sm font-medium">Nosotros</a>
            <a href="/clases" className="text-sm font-medium">Clases</a>
            <a href="/donaciones" className="text-sm font-medium">Donaciones</a>
          </nav>
        </div>
      </header>

      {/* Contenido Dinámico */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50">
        <div className="container mx-auto py-8 px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Escuela de Música Barrial. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}