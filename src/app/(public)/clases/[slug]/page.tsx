import { getCollectionAdmin } from "@/services/admin-services";
import Contact from "@/components/sections/contact/Contact";
import DynamicSection from "@/components/DynamicSection/DynamicSection"; // Importamos el slider
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
      description: classItem.description,
      images: classItem.image_url ? [{ url: classItem.image_url }] : [],
    }
  };
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: classes } = await getCollectionAdmin("clases");
  
  // 1. Buscamos la clase actual
  const classItem = classes?.find((c: any) => c.slug === slug);

  if (!classItem) return <div className="p-20 text-center uppercase tracking-widest font-bold text-slate-400">Clase no encontrada</div>;

  // 2. Preparamos las "Otras Clases" para el Slider
  // Filtramos la clase actual para que no se sugiera a sí misma
  const otherClassesRaw = classes?.filter((c: any) => c.slug !== slug) || [];
  
  // Mapeamos al formato UniversalCardData que pide el DynamicSection
  const otherClassesData: UniversalCardData[] = otherClassesRaw.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    title: c.name,
    description: c.teacher_name, // Mostramos el profe como descripción corta en el slider
    image_url: c.image_url,
    color: "orange" as const, // Color corporativo de clases
    label: c.instrument || "Música"
  }));

  return (
    <article className="w-full bg-white">
      {/* NAVEGACIÓN */}
      <nav className="w-full pt-8 pb-4 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/clases" className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Nuestras Clases</span>
        </Link>
        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <Share2 size={18} />
        </button>
      </nav>

      {/* CUERPO PRINCIPAL */}
      <section className="w-full px-6 md:px-16 pb-20 lg:max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-12 items-start">
          
          <div className="lg:col-span-7 order-2 lg:order-1">
            <header className="mb-12">
              <div className="flex items-center gap-3 text-green-600 font-bold text-[10px] mb-4 uppercase tracking-[0.3em]">
                <Music size={12} />
                <span>Formación Musical</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-slate-900 leading-[0.95] mb-8">
                {classItem.name}
              </h1>

              <div className="flex flex-wrap gap-8 py-8 border-y border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Docente</p>
                    <p className="text-sm font-bold text-slate-900">{classItem.teacher_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Horarios</p>
                    <p className="text-sm font-bold text-slate-900">{classItem.schedule}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]">
              <div className="whitespace-pre-line font-serif selection:bg-green-100">
                {classItem.description}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-8">
            <div className="relative group">
              <div className="aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl shadow-slate-200">
                {classItem.image_url ? (
                  <Image 
                    src={classItem.image_url}
                    alt={classItem.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-w-768px) 100vw, 40vw"
                    priority
                    quality={85}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Music size={40} className="text-slate-200" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SLIDER DE OTRAS CLASES (DynamicSection) */}
      {otherClassesData.length > 0 && (
        <DynamicSection 
          title="Otras Clases"
          description="Explora más disciplinas y encuentra la que mejor se adapte a vos."
          items={otherClassesData}
          layout="slider"
          basePath="/clases"
        />
      )}

      {/* 4. FORMULARIO DE CONTACTO */}
      <Contact 
        category="clases" 
        hasForm={true}
        customTitle={`Inscribite a ${classItem.name}`}
        customDescription="Sumate a nuestra comunidad. Completa tus datos para reservar una vacante o realizar una consulta."
      />
    </article>
  );
}