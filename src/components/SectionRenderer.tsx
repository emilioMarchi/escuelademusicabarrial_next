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
  rawItems?: (Class | News)[]; 
}

export default function SectionRenderer({ 
  sectionData, 
  pageCategory, 
  rawItems = [] 
}: SectionRendererProps) {

  if (!sectionData) return null;
  const isHome = pageCategory === "inicio";

  switch (sectionData.type) {
    
    case "hero":
      return (
        <Hero 
          title={sectionData.content?.title || "Escuela de Música"} 
          description={sectionData.content?.subtitle || ""} 
          // CONECTOR VITAL: Pasa las imágenes desde Firebase al Hero
          slides={sectionData.content?.slides || []} 
        />
      );

    case "texto-bloque":
      return (
        <TextBlock
          title={sectionData.content?.title}
          text={sectionData.content?.description || ""}
          imageUrl={sectionData.content?.image_url}
          imagePosition={sectionData.settings?.layout === 'image-left' ? 'left' : 'right'}
        />
      );

    case "clases": {
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
          layout={(sectionData.settings?.layout as "slider" | "grid") || (isHome ? "slider" : "grid")} 
          basePath="/clases"
        />
      );
    }

    case "noticias": {
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
      return <Contact category={pageCategory || 'contacto'} hasForm={true} />;

    default:
      return null;
  }
}