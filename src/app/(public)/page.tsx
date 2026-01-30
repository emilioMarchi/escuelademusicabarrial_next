import { getPageConfig } from "@/services/pages-services";
import SectionRenderer from "@/components/SectionRenderer";
import { notFound } from "next/navigation";

export default async function HomePage() {
  // Forzamos que en la raíz se cargue la data de "inicio"
  const pageData = await getPageConfig("inicio");

  if (!pageData) {
    return notFound();
  }

  return (
    <div>
      {pageData.sections.map((sectionId: string) => (
        <SectionRenderer 
          key={sectionId} 
          sectionId={sectionId} 
          pageData={pageData} 
        />
      ))}
    </div>
  );
}