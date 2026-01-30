// src/components/SectionRenderer.tsx
import Hero from "./sections/hero/Hero";
import DynamicSection from "./DynamicSection/DynamicSection";
import { Class, News, UniversalCardData } from "@/types";
import Contact from "./sections/hero/contact/Contact";
// Tipamos las props para mayor seguridad
interface SectionRendererProps {
  sectionId: string;
  pageData: any;
  rawItems?: any[]; // La data que vendrá de Firebase (clases o noticias)
}

export default function SectionRenderer({ sectionId, pageData, rawItems = [] }: SectionRendererProps) {
  const isHome = pageData.slug === "inicio";

  switch (sectionId) {
    case "hero":
      return (
        <Hero 
          title={pageData.header_title} 
          description={pageData.header_description} 
        />
      );
    case "contacto":
        return (
            <Contact 
            category={'clases'} 
            hasForm={pageData.has_form} 
            />
        );

    case "clases": {
      // Mapeamos de Class (tu interface) a UniversalCardData
      const classesData: UniversalCardData[] = rawItems.map((c: Class) => ({
        id: c.id,
        title: c.name,
        description: c.description,
        label: c.instrument,
        slug: c.id,
        color: "green", // Color principal de clases
      }));

      return (
        <DynamicSection 
          title="Nuestras Clases" 
          items={classesData} 
          layout={isHome ? "slider" : "grid"} 
          basePath="/clases"
        />
      );
    }

    case "noticias": {
      // Mapeamos de News (tu interface) a UniversalCardData
      const newsData: UniversalCardData[] = rawItems.map((n: News) => ({
        id: n.id,
        title: n.title,
        description: n.excerpt,
        label: "Novedades",
        slug: n.id,
        color: "orange", // Color principal de noticias
      }));

      return (
        <DynamicSection 
          title="Noticias del Barrio" 
          items={newsData} 
          layout={isHome ? "slider" : "grid"} 
          basePath="/noticias"
        />
      );
    }

    default:
      return null;
  }
}