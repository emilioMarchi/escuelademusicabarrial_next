// src/app/(public)/page.tsx
import { getPageBySlug } from "@/services/content";
import { getCollectionByCategory } from "@/services/pages-services";
import { Class, News } from "@/types";
import SectionRenderer from "@/components/SectionRenderer";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const pageData = await getPageBySlug("inicio");
  if (!pageData) return notFound();

  const [dbClasses, dbNews] = await Promise.all([
    getCollectionByCategory<Class>("clases", "clases"),
    getCollectionByCategory<News>("noticias", "noticias")
  ]);

  return (
    <main> {/* Sin container ni padding para que el Hero sea full-width */}
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