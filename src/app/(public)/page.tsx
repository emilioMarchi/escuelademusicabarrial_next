import { getPageBySlug } from "@/services/content"; // Usamos el servicio nuevo
import SectionRenderer from "@/components/SectionRenderer";
import { notFound } from "next/navigation";

export default async function HomePage() {
  // Forzamos que en la raíz se cargue la data de "inicio" con sus secciones infladas
  const pageData = await getPageBySlug("inicio");

  if (!pageData) {
    // Si no existe la página inicio en la DB, tiramos 404
    return notFound();
  }

  const hasSections = pageData.renderedSections && pageData.renderedSections.length > 0;

  return (
    <article className=" mx-auto ">
      <div className="space-y-12">
        {hasSections ? (
          pageData.renderedSections.map((section) => (
            <SectionRenderer 
              key={section.id} 
              sectionData={section} // Pasamos el OBJETO, ahora sí es consistente
              pageCategory={pageData.category}
              rawItems={[]} // Por ahora vacío hasta conectar Clases/Noticias
            />
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-medium">
              Configurá las secciones de la Home en el Dashboard.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}