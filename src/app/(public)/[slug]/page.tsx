import { getPageBySlug, getElementBySlug } from "@/services/content"; 
import { getCollectionByCategory } from "@/services/pages-services";
import { Class, News, SectionData } from "@/types"; // Importamos SectionData
import SectionRenderer from "@/components/SectionRenderer";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  if (slug === "gracias") return { title: "¡Gracias por tu donación!" };
  
  const pageData = await getPageBySlug(slug);
  if (pageData) return { title: pageData.meta_title };

  const element = await getElementBySlug(slug);
  if (element) return { title: element.name || element.title };
  
  return { title: "Escuela de Música Barrial" };
}

export default async function DynamicRouterPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "inicio") redirect("/");

  // --- PASO 0: Intercepción manual para Mercado Pago ---
  if (slug === "gracias") {
    return (
      <main>
        <SectionRenderer 
          sectionData={{
            id: "success-payment-static",
            type: "donacion-exitosa",
            content: {},
            settings: {}
          } as SectionData} // Tipado correctamente en lugar de 'any'
        />
      </main>
    );
  }

  // --- PASO 1: ¿Es una Página Dinámica? ---
  const pageData = await getPageBySlug(slug);

  if (pageData) {
    const [dbClasses, dbNews] = await Promise.all([
      getCollectionByCategory<Class>("clases", "clases"),
      getCollectionByCategory<News>("noticias", "noticias")
    ]);

    return (
      <main>
        {/* LA CLAVE: Tipamos 'section' como SectionData e 'index' como number */}
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

  // --- PASO 2: ¿Es el detalle de una Clase o Noticia? ---
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