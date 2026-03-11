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
  CategoryType,
  Group
} from "@/types";

interface SectionRendererProps {
  sectionData: SectionData; 
  pageCategory?: CategoryType; 
  rawItems?: (Class | News)[];
  id?: string; 
  urlFormMode?: string; 
  allGroups?: Group[];
}

export default function SectionRenderer({ 
  sectionData, 
  pageCategory, 
  rawItems = [], 
  id,
  urlFormMode,
  allGroups = []
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
      const classesData: UniversalCardData[] = (rawItems as Class[]).map(c => {
        // SSOT: Filtramos los grupos que pertenecen a esta clase
        const classGroups = allGroups.filter(g => g.class_id === c.id);
        
        // Derivamos docentes
        const teachers = Array.from(new Set(classGroups.flatMap(g => g.teacher_names || [])));
        
        // Derivamos horario (resumen consolidado para la card)
        const schedules = Array.from(new Set(classGroups.map(g => g.schedule).filter(Boolean)));
        const scheduleSummary = schedules.length > 0 ? schedules.join(" / ") : undefined;

        return {
          id: c.id, 
          title: c.name, 
          description: c.description,
          label: classGroups.length > 0 ? `${classGroups.length} comisiones` : "Clases", 
          image_url: c.image_url, 
          slug: (c as any).slug || slugify(c.name), 
          color: "orange" as const,
          teachers: teachers.length > 0 ? teachers : undefined,
          schedule: scheduleSummary
        };
      });

      // LÓGICA DE DISEÑO: Home siempre slider, Página de Clases siempre grid
      const effectiveLayout = isHome ? "slider" : (pageCategory === "clases" ? "grid" : (sectionData.settings?.layout as any || "grid"));

      return (
        <section id={id}>
          <DynamicSection 
            title={sectionData.content?.title || "Nuestras Clases"} 
            description={sectionData.content?.description}
            items={classesData} 
            layout={effectiveLayout} 
            basePath="/clases" 
          />
        </section>
      );
    }

    case "noticias": {
      // ORDENAMIENTO POR FECHA (Descendente: más reciente primero)
      const sortedNews = [...(rawItems as News[])].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      const newsData: UniversalCardData[] = sortedNews.map(n => ({
        id: n.id, 
        title: n.title, 
        description: (n as any).excerpt || n.description,
        label: "Novedades", 
        image_url: n.image_url, 
        slug: (n as any).slug || slugify(n.title), 
        color: "green" as const,
        // CORRECCIÓN: Mapeo de datos formateados para que CardItem los vea
        date: n.date 
          ? new Date(n.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
          : undefined
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
      
      if (urlFormMode === 'inscripcion' || urlFormMode === 'clases') {
        effectiveCategory = 'clases';
      } else if (urlFormMode === 'contacto' || urlFormMode === 'general') {
        effectiveCategory = 'contacto';
      } 
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
            classId={sectionData.content?.class_id}
            className={sectionData.content?.class_name}
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