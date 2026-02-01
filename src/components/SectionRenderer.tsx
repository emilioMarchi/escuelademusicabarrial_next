import Hero from "./sections/hero/Hero";
import DynamicSection from "./DynamicSection/DynamicSection";
import Contact from "./sections/contact/Contact";
import TextBlock from "./sections/textBlock/TextBlock"; 
import { 
  Class, 
  News, 
  UniversalCardData, 
  SectionData, 
  CategoryType 
} from "@/types";

interface SectionRendererProps {
  sectionData: SectionData; 
  pageCategory?: CategoryType; 
  // Definimos que puede ser un array de clases o noticias
  rawItems?: (Class | News)[]; 
}

export default function SectionRenderer({ 
  sectionData, 
  pageCategory, 
  rawItems = [] 
}: SectionRendererProps) {

  if (!sectionData) {
    console.warn("⚠️ SectionRenderer recibió data vacía.");
    return null;
  }

  const isHome = pageCategory === "inicio";

  switch (sectionData.type) {
    
    case "hero":
      return (
        <Hero 
          title={sectionData.content?.title || "Escuela de Música"} 
          description={sectionData.content?.subtitle || ""} 
        />
      );

    case "texto-bloque":
      return (
        <TextBlock
          title={sectionData.content?.title}
          text={sectionData.content?.description || ""}
          // Usamos "as any" o actualizamos la interfaz SectionData (ver nota abajo)
          imageUrl={(sectionData.content as any).image_url}
          imagePosition={sectionData.settings?.layout === 'image-left' ? 'left' : 'right'}
        />
      );

    case "clases": {
      // 1. Forzamos el tipo: le decimos a TS que aquí rawItems es Class[]
      const classes = rawItems as Class[];

      const classesData: UniversalCardData[] = classes.map((c) => ({
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
          // Casting para el layout para que coincida con lo que espera DynamicSection
          layout={(sectionData.settings?.layout as "slider" | "grid") || (isHome ? "slider" : "grid")} 
          basePath="/clases"
        />
      );
    }

    case "noticias": {
      // 2. Forzamos el tipo: le decimos a TS que aquí rawItems es News[]
      const news = rawItems as News[];

      const newsData: UniversalCardData[] = news.map((n) => ({
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
          layout={(sectionData.settings?.layout as "slider" | "grid") || (isHome ? "slider" : "grid")} 
          basePath="/noticias"
        />
      );
    }

    case "contacto":
      return (
        <Contact 
          category={pageCategory || 'contacto'}
          hasForm={true} 
        />
      );

    default:
      console.warn(`Type "${sectionData.type}" no reconocido en SectionRenderer`);
      return null;
  }
}