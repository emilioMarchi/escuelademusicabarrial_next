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
  id?: string; 
  urlFormMode?: string; // Nueva prop
}

export default function SectionRenderer({ 
  sectionData, 
  pageCategory, 
  rawItems = [], 
  id,
  urlFormMode 
}: SectionRendererProps) {

  if (!sectionData) return null;
  const isHome = pageCategory === "inicio";

  switch (sectionData.type) {
    
    case "hero":
      return (
        <section id={id}>
          <Hero 
            title={sectionData.content?.title} 
            description={sectionData.content?.description} 
            slides={sectionData.content?.slides || []} 
          />
        </section>
      );

    case "texto-bloque":
      return (
        <section id={id}>
          <TextBlock
            title={sectionData.content?.title}
            text={sectionData.content?.description || ""}
            imageUrl={sectionData.content?.image_url}
            imagePosition={sectionData.settings?.layout === "image-left" ? "left" : "right"}
          />
        </section>
      );

    case "clases": {
      const classesData: UniversalCardData[] = (rawItems as Class[]).map(c => ({
        id: c.id, 
        title: c.name, 
        description: c.teacher_name || c.description,
        label: c.instrument, 
        image_url: c.image_url, 
        slug: (c as any).slug || slugify(c.name), 
        color: "orange" as const 
      }));

      return (
        <section id={id}>
          <DynamicSection 
            title={sectionData.content?.title || "Nuestras Clases"} 
            description={sectionData.content?.description}
            items={classesData} 
            layout={(sectionData.settings?.layout as any) || (isHome ? "slider" : "grid")} 
            basePath="/clases" 
          />
        </section>
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
        color: "green" as const 
      }));

      return (
        <section id={id}>
          <DynamicSection 
            title={sectionData.content?.title || "Noticias del Barrio"} 
            description={sectionData.content?.description}
            items={newsData} 
            layout={(sectionData.settings?.layout as any) || (isHome ? "slider" : "grid")} 
            basePath="/novedades" 
          />
        </section>
      );
    }

    case "contacto": {
      const adminSelection = sectionData.settings?.form_type || sectionData.content?.form_type;
      let effectiveCategory = pageCategory || "contacto";
      
      // PRIORIDAD 1: Parámetro en la URL (?form=inscripcion)
      if (urlFormMode === 'inscripcion' || urlFormMode === 'clases') {
        effectiveCategory = 'clases';
      } else if (urlFormMode === 'contacto' || urlFormMode === 'general') {
        effectiveCategory = 'contacto';
      } 
      // PRIORIDAD 2: Selección del administrador si no hay parámetro en URL
      else {
        if (adminSelection === 'clases' || adminSelection === 'inscripcion') {
            effectiveCategory = 'clases';
        }
        if (adminSelection === 'general' || adminSelection === 'contacto') {
            effectiveCategory = 'contacto';
        }
      }

      return (
        <section id={id}>
          <Contact 
            category={effectiveCategory} 
            hasForm={true} 
            customTitle={sectionData.content?.title}
            customDescription={sectionData.content?.description}
          />
        </section>
      );
    } 

    case "donaciones": {
      const defaultAmount = sectionData.settings?.default_amount ? Number(sectionData.settings.default_amount) : undefined;

      return (
        <section id={id}>
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