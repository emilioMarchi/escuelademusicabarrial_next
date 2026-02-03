import { getPageBySlug, getElementBySlug } from "@/services/content"; 
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
  
  // 1. Intentamos buscar como Página
  const pageData = await getPageBySlug(slug);
  if (pageData) return { title: pageData.meta_title };

  // 2. Si no es página, buscamos como Clase o Noticia para el título
  const element = await getElementBySlug(slug); // Función que busca en clases/noticias
  if (element) return { title: element.name || element.title };

  return { title: "Escuela de Música Barrial" };
}

export default async function DynamicRouterPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "inicio") redirect("/");

  // --- PASO 1: ¿Es una Página Dinámica (Nosotros, Contacto, etc)? ---
  const pageData = await getPageBySlug(slug);

  if (pageData) {
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

  // --- PASO 2: ¿Es el detalle de una Clase o Noticia? ---
  const element = await getElementBySlug(slug); 
  
  if (element) {
    // Si es una clase, podrías renderizar un componente de "Detalle"
    // Aquí podrías diferenciar por una propiedad 'category' o 'type' que venga de la DB
    return (
      <div className="pt-40 pb-20 container mx-auto px-4">
        <h1 className="text-6xl font-black uppercase">{element.name || element.title}</h1>
        <p className="mt-6 text-xl text-slate-600">{element.description || element.excerpt}</p>
        {/* Aquí iría el resto de la info del elemento */}
      </div>
    );
  }

  // --- PASO 3: Si no es nada, 404 ---
  return notFound();
}