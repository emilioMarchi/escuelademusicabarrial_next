// src/app/(public)/galeria/page.tsx
import { getGalleryImagesPublic } from "@/services/admin-services";
import { getPageBySlug } from "@/services/content";
import GalleryClient from "./GalleryClient";
import { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("galeria");
  
  return {
    title: pageData?.meta_title || "Galería | Escuela de Música Barrial",
    description: pageData?.meta_description || "Registros visuales de nuestras actividades y conciertos.",
  };
}

export default async function GaleriaPage() {
  const [imagesRes, pageData] = await Promise.all([
    getGalleryImagesPublic(),
    getPageBySlug("galeria")
  ]);

  const images = imagesRes.success ? imagesRes.data : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* --- HERO SECTION --- */}
      {/* Aumenté un poco la altura (h-[65vh]) para dar más espacio al degradado */}
      <section className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden bg-slate-950">
        
        {pageData?.header_image_url ? (
          <>
            <Image
              src={pageData.header_image_url}
              alt={pageData.header_title || "Portada Galería"}
              fill
              priority
              // Le damos un poco más de presencia a la foto base
              className="object-cover object-center opacity-80" 
            />
            
            {/* CAPA 1: Overlay general para oscurecer y dar legibilidad al texto */}
            <div className="absolute inset-0 bg-slate-950/60" />

            {/* CAPA 2 (LA CLAVE): Degradado inferior intenso para fusión */}
            {/* Este div se ocupa el 40% inferior (h-2/5) y hace una transición fuerte de negro sólido a transparente hacia arriba */}
            <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-0" />
            
            {/* CAPA 3: Viñeta superior sutil para cerrar el encuadre */}
            <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-slate-950/80 to-transparent z-0" />
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-950" />
        )}

        {/* Contenido de texto (con z-10 para estar sobre los degradados) */}
        <div className="container mx-auto px-6 relative z-10 mt-20 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-white/70 font-black uppercase text-[10px] tracking-[0.4em] mb-6">
              Escuela de música barrial • registros
            </p>

            <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-white mb-8 tracking-tight leading-none drop-shadow-2xl">
              {pageData?.header_title || "Galería de Momentos"}
            </h1>
            
            <div className="w-24 h-[2px] bg-green-500/80 mx-auto mb-8" />
            
            <p className="text-white/80 font-medium text-base md:text-xl max-w-2xl mx-auto leading-relaxed italic drop-shadow-lg">
              {pageData?.header_description }
            </p>
          </div>
        </div>
      </section>

      {/* --- EL MOSAICO DE FOTOS --- */}
      {/* El margen negativo (-mt-24) ahora es mayor para superponerse más a la zona negra del héroe */}
      <section className="relative z-20 -mt-24 pb-32">
        {/* Un pequeño degradado superior en la sección de galería para asegurar la fusión si la primera fila de fotos es clara */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950 to-transparent -z-10" />
        
        <div className="container mx-auto pt-8 px-4">
            <GalleryClient images={images || []} />
        </div>
      </section>
    </main>
  );
}