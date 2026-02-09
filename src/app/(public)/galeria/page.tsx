// src/app/(public)/galeria/page.tsx
import { getGalleryImagesAdmin } from "@/services/admin-services";
import { getPageBySlug } from "@/services/content"; // Importamos para traer la data de la página
import GalleryClient from "./GalleryClient";
import { Metadata } from "next";

// --- METADATA DINÁMICA ---
export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("galeria");
  
  return {
    title: pageData?.meta_title || "Galería | Escuela de Música Barrial",
    description: pageData?.meta_description || "Registros visuales de nuestras actividades y conciertos.",
  };
}

export default async function GaleriaPage() {
  // Traemos las imágenes y también la data de la página por si querés usar títulos dinámicos en el h1
  const [imagesRes, pageData] = await Promise.all([
    getGalleryImagesAdmin(),
    getPageBySlug("galeria")
  ]);

  const images = imagesRes.success ? imagesRes.data : [];

  return (
    <main className="min-h-screen bg-white">
      {/* --- HEADER: Estilo Elegante con Serif e Itálica --- */}
      <section className="bg-slate-950 px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-7xl mx-auto">
          {/* Usamos el header_title de la DB o el fallback que ya tenías */}
          <h1 className="font-serif italic text-3xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight leading-[1.2]">
            {pageData?.header_title || "Nuestra Galería de Momentos"}
          </h1>
          
          <div className="w-12 h-[1px] bg-white/20 mb-6" />
          
          <p className="text-white/40 font-bold uppercase text-[9px] tracking-[0.5em]">
            {pageData?.header_description || "Escuela de música barrial • registros visuales"}
          </p>
        </div>
      </section>

      {/* --- EL MOSAICO DE FOTOS (GalleryClient) --- */}
      <section className="pb-20">
        <GalleryClient images={images || []} />
      </section>
    </main>
  );
}