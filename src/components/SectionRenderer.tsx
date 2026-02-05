// src/components/sections/SectionRenderer.tsx
import Hero from "./sections/hero/Hero";
import DynamicSection from "./DynamicSection/DynamicSection";
import Contact from "./sections/contact/Contact";
import TextBlock from "./sections/textBlock/TextBlock"; 
import { slugify } from "@/lib/utils";  
import DonationForm from "./sections/donations/DonationForm";
import DonationSuccess from "./sections/donations/DonationSucces";
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
          description={sectionData.content?.description} 
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
      const classesData: UniversalCardData[] = (rawItems as Class[]).map(c => ({
        id: c.id, 
        title: c.name, 
        description: c.teacher_name || c.description,
        label: c.instrument, 
        image_url: c.image_url, 
        slug: (c as any).slug || slugify(c.name), 
        color: "orange" as const // <--- Clases en Naranja
      }));

      return (
        <DynamicSection 
          title={sectionData.content?.title || "Nuestras Clases"} 
          description={sectionData.content?.description}
          items={classesData} 
          layout={(sectionData.settings?.layout as any) || (isHome ? "slider" : "grid")} 
          basePath="/clases" 
        />
      );
    }

    case "noticias": {
      const newsData: UniversalCardData[] = (rawItems as News[]).map(n => ({
        id: n.id, 
        title: n.title, 
        description: (n as any).excerpt || n.description,
        label: "Novedades", 
        image_url: n.image_url, 
        slug: (n as any).slug || slugify(n.title), 
        color: "green" as const // <--- Noticias en Verde
      }));

      return (
        <DynamicSection 
          title={sectionData.content?.title || "Noticias del Barrio"} 
          description={sectionData.content?.description}
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

    case "donaciones": {
      const defaultAmount = sectionData.settings?.default_amount ? Number(sectionData.settings.default_amount) : undefined;

      return (
        <section> 
          <DonationForm 
            title={sectionData.content?.title} 
            description={sectionData.content?.description}
            backgroundImage={sectionData.content?.image_url}
            initialAmount={defaultAmount}
          />
        </section>
      );
      
    } 
    case "donacion-exitosa":
      return <DonationSuccess />;

    default:
      return null;
  }
}