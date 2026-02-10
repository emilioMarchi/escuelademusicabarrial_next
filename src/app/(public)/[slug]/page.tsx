import { getPageBySlug, getElementBySlug } from "@/services/content"; 
import { getCollectionByCategory } from "@/services/pages-services";
import { Class, News, SectionData } from "@/types";
import SectionRenderer from "@/components/SectionRenderer";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  if (slug === "gracias") return { title: "¡Gracias por tu donación!" };
  
  // Intentar obtener data de página
  const pageData = await getPageBySlug(slug);
  if (pageData) {
    return {
      title: pageData.meta_title || pageData.header_title,
      description: pageData.meta_description,
      openGraph: {
        title: pageData.meta_title || pageData.header_title,
        description: pageData.meta_description,
        images: pageData.header_image_url ? [{ url: pageData.header_image_url }] : [],
      }
    };
  }

  // Intentar obtener detalle de ítem (Noticia o Clase si cae aquí)
  const element = await getElementBySlug(slug);
  if (element) {
    const title = element.name || element.title;
    const desc = element.description || element.excerpt;
    return {
      title: `${title} | Escuela de Música Barrial`,
      description: desc?.substring(0, 160),
      openGraph: {
        title: title,
        description: desc,
        images: element.image_url ? [{ url: element.image_url }] : [],
      }
    };
  }
  
  return { title: "Escuela de Música Barrial" };
}

export default async function DynamicRouterPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "inicio") redirect("/");

  if (slug === "gracias") {
    return (
      <main>
        <SectionRenderer 
          sectionData={{
            id: "success-payment-static",
            type: "donacion-exitosa",
            content: {},
            settings: {}
          } as SectionData} 
        />
      </main>
    );
  }

  const pageData = await getPageBySlug(slug);

  if (pageData) {
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

  const element = await getElementBySlug(slug); 
  
  if (element) {
    return (
      <div className="pt-40 pb-20 container mx-auto px-4">
        <h1 className="text-6xl font-black uppercase">{element.name || element.title}</h1>
        <p className="mt-6 text-xl text-slate-600">{element.description || element.excerpt}</p>
      </div>
    );
  }

  return notFound();
}