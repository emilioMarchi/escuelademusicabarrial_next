import { getPageBySlug } from "@/services/content";
import { getCollectionByCategory } from "@/services/pages-services";
import { Class, News } from "@/types";
import SectionRenderer from "@/components/SectionRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("inicio");
  return {
    title: pageData?.meta_title || "Inicio | Escuela de Música Barrial",
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
      {pageData.renderedSections.map((section) => {
        let itemsToPass: any[] = [];
        if (section.type === "clases") itemsToPass = dbClasses;
        if (section.type === "noticias") itemsToPass = dbNews;

        return (
          <SectionRenderer 
            key={section.id} 
            sectionData={section} 
            pageCategory={pageData.category}
            rawItems={itemsToPass}
          />
        );
      })}
    </main>
  );
}