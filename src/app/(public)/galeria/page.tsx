import { getGalleryImagesAdmin } from "@/services/admin-services";
import GalleryClient from "./GalleryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galería | Escuela de Música Barrial",
  description: "Registros visuales de nuestras actividades y conciertos.",
};

export default async function GaleriaPage() {
  const { success, data: images } = await getGalleryImagesAdmin();

  return (
    <main className="min-h-screen bg-white">
      {/* --- HEADER: Estilo Elegante con Serif e Itálica --- */}
      <section className="bg-slate-950 px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-7xl mx-auto">
          {/* Las clases que pediste aplicadas al h1 */}
          <h1 className="font-serif italic text-3xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight leading-[1.2]">
            Nuestra Galería de Momentos
          </h1>
          
          {/* Detalle minimalista: línea sutil */}
          <div className="w-12 h-[1px] bg-white/20 mb-6" />
          
          <p className="text-white/40 font-bold uppercase text-[9px] tracking-[0.5em]">
            Escuela de música barrial • registros visuales
          </p>
        </div>
      </section>

      {/* --- EL MOSAICO DE FOTOS (GalleryClient) --- */}
      <section className="pb-20">
        <GalleryClient images={success ? images : []} />
      </section>
    </main>
  );
}