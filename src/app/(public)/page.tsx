// src/app/(public)/page.tsx
import { getPageConfig } from "@/services/pages-services";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const pageData = await getPageConfig("inicio");

  if (!pageData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando configuración de inicio...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
          {pageData.header_title}
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          {pageData.header_description}
        </p>
      </section>

      {/* Renderizado de Secciones del Blueprint */}
      <div className="space-y-20">
        {pageData.sections.map((section) => (
          <div key={section} className="py-10 border-t">
            {/* Aquí inyectaremos los componentes según el ID de sección */}
            <p className="text-center italic">Espacio para sección: {section}</p>
          </div>
        ))}
      </div>
    </div>
  );
}