import Hero from "./sections/hero/Hero";
import DynamicSection from "./DynamicSection/DynamicSection";
import Contact from "./sections/contact/Contact";
import TextBlock from "./sections/textBlock/TextBlock"; 
import { slugify } from "@/lib/utils";  

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
          title={sectionData.content?.title} 
          description={sectionData.content?.description} // <--- Corregido: Ahora usa la propiedad correcta
          slides={sectionData.content?.slides || []} 
        />
      );

    case "texto-bloque":
      return (
        <TextBlock
          title={sectionData.content?.title}
          text={sectionData.content?.description || ""}
          imageUrl={sectionData.content?.image_url}
          imagePosition={sectionData.settings?.layout === "image-left" ? "left" : "right"}
        />
      );

    case "clases": {
      const classes = rawItems as Class[];
      const classesData: UniversalCardData[] = classes.map((c) => ({
        id: c.id,
        title: c.name,
        description: c.teacher_name || c.description,
        label: c.instrument,
        slug: c.slug || slugify(c.name), 
        color: "green",
      }));

      return (
        <DynamicSection 
          title={sectionData.content?.title || "Nuestras Clases"} 
          items={classesData} 
          layout={(sectionData.settings?.layout as any) || (isHome ? "slider" : "grid")} 
          basePath="/clases"
        />
      );
    }

    case "noticias": {
      const news = rawItems as News[];
      const newsData: UniversalCardData[] = news.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.excerpt || n.description,
        label: "Novedades",
        slug: n.slug || slugify(n.title), 
        color: "orange",
      }));

      return (
        <DynamicSection 
          title={sectionData.content?.title || "Noticias del Barrio"} 
          items={newsData} 
          layout={(sectionData.settings?.layout as any) || (isHome ? "slider" : "grid")} 
          basePath="/novedades"
        />
      );
    }

    case "contacto": {
      const adminSelection = sectionData.settings?.form_type;
      let effectiveCategory = pageCategory || "contacto";
      
      if (adminSelection === 'inscripcion') effectiveCategory = 'clases';
      if (adminSelection === 'general') effectiveCategory = 'contacto';

      return (
        <Contact 
          category={effectiveCategory} 
          hasForm={true} 
          customTitle={sectionData.content?.title}
          customDescription={sectionData.content?.description}
        />
      );
    }

    default:
      return null;
  }
}