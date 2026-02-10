// src/app/(public)/layout.tsx
import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { fetchGeneralSettings } from "@/services/settings-services";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://escuelademusicabarrial.ar"), // Reemplaza con tu dominio real
  title: {
    template: "%s | Escuela de Música Barrial",
    default: "Escuela de Música Barrial",
  }
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Llamamos al fetch dentro de la función (Server Component)
  const settings = await fetchGeneralSettings();
  
  // 2. Limpiamos la data para evitar el error de "Plain Objects" (Timestamps de Firebase)
  const safeSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Contenido Dinámico */}
      <main className="w-full flex-grow">
        {children}
      </main>

      {/* Footer - Solo pasamos la data si existe, o un objeto vacío para evitar errores */}
      <Footer data={safeSettings || {}} />
    </div>
  );
}