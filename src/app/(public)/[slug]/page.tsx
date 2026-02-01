import { getPageBySlug } from "@/services/content";
import { getCollectionByCategory } from "@/services/pages-services";
import { Class, News } from "@/types";
import SectionRenderer from "@/components/SectionRenderer";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Protección: si no hay slug, no consultamos
  if (!slug) return { title: "Escuela de Música Barrial" };

  const pageData = await getPageBySlug(slug);

  return {
    title: pageData?.meta_title || "Escuela de Música Barrial",
    description: pageData?.meta_description || "",
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  // 1. Si el slug es "inicio", redirigimos a la raíz para mantener el SEO limpio
  if (slug === "inicio") {
    redirect("/");
  }

  // 2. Traemos la configuración de la página
  const pageData = await getPageBySlug(slug);

  if (!pageData) {
    return notFound();
  }

  // 3. Traemos la data de las colecciones globales
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