import { getPageBySlug } from "@/services/content";
import { getCollectionByCategory } from "@/services/pages-services";
import { Class, News, SectionData } from "@/types";
import SectionRenderer from "@/components/SectionRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("inicio");
  const siteTitle = pageData?.meta_title || "Escuela de Música Barrial";

  return {
    title: {
      absolute: siteTitle // Fuerza a que sea solo este texto
    },
    description: pageData?.meta_description || "Bienvenidos a la Escuela de Música del barrio.",
  };
}
export default async function HomePage() {
  const pageData = await getPageBySlug("inicio");
  
  if (!pageData) return notFound();

  const [dbClasses, dbNews] = await Promise.all([
    getCollectionByCategory<Class>("clases", "clases"),
    getCollectionByCategory<News>("noticias", "noticias")
  ]);

  return (
    <main>
      {pageData.renderedSections.map((section: SectionData, index: number) => {
        let itemsToPass: any[] = [];
        if (section.type === "clases") itemsToPass = dbClasses;
        if (section.type === "noticias") itemsToPass = dbNews;

        return (
          <SectionRenderer 
            key={section.id || index} 
            sectionData={section} 
            pageCategory={pageData.category}
            rawItems={itemsToPass}
          />
        );
      })}
    </main>
  );
}