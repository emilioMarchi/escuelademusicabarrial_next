// src/components/SectionRenderer.tsx
import Hero from "./sections/hero/Hero";
import DynamicSection from "./DynamicSection/DynamicSection";
import Contact from "./sections/contact/Contact";
import { Class, News, UniversalCardData, SectionData, CategoryType } from "@/types";

interface SectionRendererProps {
  sectionData: SectionData; 
  pageCategory?: CategoryType; 
  rawItems?: any[]; 
}

export default function SectionRenderer({ sectionData, pageCategory, rawItems = [] }: SectionRendererProps) {
  // --- ESCUDO DE SEGURIDAD ---
  // Si por alguna razón la data no llega (porque no existe en la DB todavía),
  // cortamos acá y no renderizamos nada. Así evitamos el error "reading 'type'".
  if (!sectionData) {
    console.warn("⚠️ SectionRenderer recibió data vacía. Revisar servicio o DB.");
    return null;
  }
  // ---------------------------

  const isHome = pageCategory === "inicio";

  // Ahora sí, es seguro leer .type porque sabemos que sectionData existe
  switch (sectionData.type) {
    case "hero":
      return (
        <Hero 
          // Usamos encadenamiento opcional (?.) por si content viene vacío
          title={sectionData.content?.title || ""} 
          description={sectionData.content?.subtitle || ""} 
        />
      );

    case "contacto":
      return (
        <Contact 
          category={pageCategory || 'contacto'}
          hasForm={true} 
        />
      );

    case "clases": {
      const classesData: UniversalCardData[] = rawItems.map((c: Class) => ({
        id: c.id,
        title: c.name,
        description: c.description,
        label: c.instrument,
        slug: c.id,
        color: "green",
      }));

      return (
        <DynamicSection 
          title={sectionData.content?.title || "Nuestras Clases"} 
          items={classesData} 
          layout={sectionData.settings?.layout || (isHome ? "slider" : "grid")} 
          basePath="/clases"
        />
      );
    }

    case "noticias": {
      const newsData: UniversalCardData[] = rawItems.map((n: News) => ({
        id: n.id,
        title: n.title,
        description: n.excerpt,
        label: "Novedades",
        slug: n.id,
        color: "orange",
      }));

      return (
        <DynamicSection 
          title={sectionData.content?.title || "Noticias del Barrio"} 
          items={newsData} 
          layout={sectionData.settings?.layout || (isHome ? "slider" : "grid")} 
          basePath="/noticias"
        />
      );
    }

    default:
      return null;
  }
}