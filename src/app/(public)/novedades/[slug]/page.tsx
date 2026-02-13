// src/app/(public)/novedades/[slug]/page.tsx
import { getCollectionAdmin } from "@/services/admin-services";
import Contact from "@/components/sections/contact/Contact";
import DynamicSection from "@/components/DynamicSection/DynamicSection";
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Tag, 
  Sparkles, 
  Newspaper 
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { UniversalCardData } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: news } = await getCollectionAdmin("noticias");
  const item = news?.find((n: any) => n.slug === slug);

  if (!item) return { title: "Noticia no encontrada" };

  return {
    title: `${item.title} | Novedades`,
    description: item.description?.substring(0, 160),
    openGraph: {
      title: item.title,
      description: item.description?.substring(0, 160),
      images: [{ url: item.image_url || "/favicon.png" }],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: news } = await getCollectionAdmin("noticias");

  const allItems = (news as any[]) || [];
  const item = allItems.find((n: any) => n.slug === slug && n.is_active);

  if (!item) {
    return (
      <div className="p-40 text-center font-black uppercase tracking-widest text-slate-300 text-xs">
        Noticia no encontrada
      </div>
    );
  }

  // LÓGICA DE CAPITALIZACIÓN PARA LA CATEGORÍA
  const rawCategory = item.category || "novedades";
  const formattedCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

  const otherNewsData: UniversalCardData[] = allItems
    .filter((n: any) => n.slug !== slug && n.is_active)
    .map((n: any) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      description: n.description?.substring(0, 80) + "...",
      image_url: n.image_url, 
      color: "green",
      label: "Novedad",
    }));

  return (
    <article className="w-full bg-white">
      <nav className="w-full pt-12 pb-6 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/novedades" className="flex items-center gap-3 text-slate-400 hover:text-green-600 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Volver a Novedades</span>
        </Link>
        <button className="text-slate-300 hover:text-slate-900 transition-colors">
          <Share2 size={20} />
        </button>
      </nav>

      <section className="w-full px-6 md:px-16 pb-24 lg:max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-12 items-start">
          
          <div className="lg:col-span-7 order-2 lg:order-1">
            <header className="mb-12">
              <div className="flex items-center gap-3 text-green-600 font-bold text-[11px] mb-6 uppercase tracking-[0.4em]">
                <Newspaper size={14} strokeWidth={2.5} />
                <span>Actualidad del Barrio</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-serif italic text-slate-900 leading-[0.95] mb-12 tracking-tight">
                {item.title}
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                   <Calendar size={20} className="text-green-600" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Publicado el</p>
                     <p className="text-sm font-bold text-slate-900 leading-snug">
                        {item.date || "Reciente"}
                     </p>
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                   <Tag size={20} className="text-green-600" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Categoría</p>
                     <p className="text-sm font-bold text-slate-900 leading-snug">
                        {/* ACÁ USAMOS EL STRING PARSEADO */}
                        {formattedCategory}
                     </p>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-12">
                 <div className="h-[1px] w-16 bg-green-500/20"></div>
                 <Sparkles size={16} className="text-green-500/40" />
                 <div className="h-[1px] flex-grow bg-slate-100"></div>
              </div>
            </header>

            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-line font-serif text-xl md:text-2xl text-slate-700 leading-relaxed first-letter:text-8xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-4 first-letter:float-left first-letter:leading-[0.7] selection:bg-green-100">
                {item.description}
              </div>
            </div>
          </div>

          {item.image_url && (
            <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-12">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3.5rem] shadow-2xl shadow-slate-200">
                <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="(max-w-768px) 100vw, 40vw" priority />
              </div>
            </div>
          )}
        </div>
      </section>

      {otherNewsData.length > 0 && (
        <div className="bg-slate-50/50 border-t border-slate-100">
          <DynamicSection title="Más Novedades" description="Mantenete al tanto de lo que pasa en la Escuela." items={otherNewsData} layout="slider" basePath="/novedades" />
        </div>
      )}

      <Contact category="contacto" hasForm={true} customTitle="¿Querés saber más?" customDescription="Escribinos si tenés dudas sobre este evento o cualquier otra actividad." />
    </article>
  );
}