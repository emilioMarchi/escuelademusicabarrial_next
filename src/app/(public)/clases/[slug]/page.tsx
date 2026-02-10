import { getCollectionAdmin } from "@/services/admin-services";
import Contact from "@/components/sections/contact/Contact";
import DynamicSection from "@/components/DynamicSection/DynamicSection";
import { User, Clock, ArrowLeft, Share2, Music } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { UniversalCardData } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: classes } = await getCollectionAdmin("clases");
  const classItem = classes?.find((c: any) => c.slug === slug);

  if (!classItem) return { title: "Clase no encontrada" };

  return {
    title: `${classItem.name} | Clases`,
    description: classItem.description?.substring(0, 160),
    openGraph: {
      title: classItem.name,
      description: classItem.description?.substring(0, 160),
      url: `https://escuelademusicabarrial.ar/clases/${slug}`,
      images: [
        {
          url: "/favicon.png", // Forzamos el favicon como miniatura
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: "summary",
      images: ["/favicon.png"],
    }
  };
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: classes } = await getCollectionAdmin("clases");
  const allItems = (classes as any[]) || [];
  const classItem = allItems.find((c: any) => c.slug === slug);

  if (!classItem) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest text-sm">Clase no encontrada</div>;

  const otherClassesData: UniversalCardData[] = allItems
    .filter((c: any) => c.slug !== slug)
    .map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.name,
      description: c.teacher_name,
      image: c.image_url,
      color: "green",
      label: c.instrument || "Música"
    }));

  return (
    <article className="w-full bg-white">
      <nav className="w-full pt-8 pb-4 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/clases" className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Nuestras Clases</span>
        </Link>
        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <Share2 size={18} />
        </button>
      </nav>

      <section className="w-full px-6 md:px-16 pb-20 lg:max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 items-start">
          
          <div className="lg:col-span-7 order-2 lg:order-1">
            <header className="mb-8">
              <div className="flex items-center gap-3 text-green-600 font-bold text-[10px] mb-3 uppercase tracking-widest">
                <Music size={12} />
                <span>Formación Musical</span>
                <span className="text-slate-200">|</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-slate-900 leading-[1.05] mb-6">
                {classItem.name}
              </h1>

              <div className="flex flex-wrap gap-6 mb-8 py-4 border-y border-slate-50">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-green-600" />
                  <span className="text-xs font-bold text-slate-800">{classItem.teacher_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-green-600" />
                  <span className="text-xs font-bold text-slate-800">{classItem.schedule}</span>
                </div>
              </div>
            </header>

            <div className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]">
              <div className="whitespace-pre-line font-serif selection:bg-green-100">
                {classItem.description}
              </div>
            </div>
          </div>

          {classItem.image_url && (
            <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-8">
              <div className="relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200">
                <Image 
                  src={classItem.image_url}
                  alt={classItem.name}
                  fill
                  className="object-cover"
                  sizes="(max-w-768px) 100vw, 40vw"
                  priority
                  quality={85}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {otherClassesData.length > 0 && (
        <DynamicSection 
          title="Otras Clases"
          description="Explora más disciplinas y encuentra la que mejor se adapte a vos."
          items={otherClassesData}
          layout="slider"
          basePath="/clases"
        />
      )}

      <Contact 
        category="clases" 
        hasForm={true}
        customTitle={`Inscribite a ${classItem.name}`}
        customDescription="Completa el formulario para reservar tu lugar o realizar una consulta."
      />
    </article>
  );
}