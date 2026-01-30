// src/app/(public)/[slug]/page.tsx
import { getPageConfig } from "@/services/pages-services";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getPageConfig(slug);
  return {
    title: pageData?.meta_title || "Página",
    description: pageData?.meta_description || "",
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const pageData = await getPageConfig(slug);

  if (!pageData) notFound();

  return (
    <article className="container mx-auto py-12 px-4">
      <header className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-bold">{pageData.header_title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{pageData.header_description}</p>
      </header>

      <div className="space-y-12">
        {pageData.sections.map((section) => (
          <section key={section}>
             {/* Lógica para decidir qué componente renderizar */}
             Contenido de: {section}
          </section>
        ))}
      </div>
    </article>
  );
}