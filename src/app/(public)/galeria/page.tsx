// src/app/(public)/galeria/page.tsx
import { getGalleryImagesAdmin } from "@/services/admin-services";
import { getPageBySlug } from "@/services/content";
import GalleryClient from "./GalleryClient";
import { Metadata } from "next";
import Image from "next/image";

// --- METADATA DINÁMICA ---
export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("galeria");
  
  return {
    title: pageData?.meta_title || "Galería | Escuela de Música Barrial",
    description: pageData?.meta_description || "Registros visuales de nuestras actividades y conciertos.",
  };
}

export default async function GaleriaPage() {
  const [imagesRes, pageData] = await Promise.all([
    getGalleryImagesAdmin(),
    getPageBySlug("galeria")
  ]);

  const images = imagesRes.success ? imagesRes.data : [];

  return (
    <main className="min-h-screen bg-white">
      {/* --- HERO SECTION: Portada dinámica --- */}
      <section className="relative h-[60vh] min-h-[450px] w-full flex items-center overflow-hidden bg-slate-950">
        
        {/* Imagen de Fondo */}
        {pageData?.header_image_url ? (
          <>
            <Image
              src={pageData.header_image_url}
              alt={pageData.header_title || "Portada Galería"}
              fill
              priority
              className="object-cover object-center"
            />
            {/* Overlay para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-white" />
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-950" />
        )}

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-4xl">
            <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.4em] mb-4">
              Escuela de música barrial • registros
            </p>

            <h1 className="font-serif italic text-4xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight leading-[1.1]">
              {pageData?.header_title || "Nuestra Galería de Momentos"}
            </h1>
            
            <div className="w-16 h-[1px] bg-green-500 mb-6" />
            
            <p className="text-white/80 font-medium text-sm md:text-base lg:text-lg max-w-xl leading-relaxed italic">
              {pageData?.header_description || "Un recorrido visual por las actividades y el día a día en el corazón del barrio."}
            </p>
          </div>
        </div>
      </section>

      {/* --- EL MOSAICO DE FOTOS (Mantenemos GalleryClient intacto) --- */}
      <section className="relative z-20 -mt-10 pb-20">
        <div className="container mx-auto">
           <GalleryClient images={images || []} />
        </div>
      </section>
    </main>
  );
}