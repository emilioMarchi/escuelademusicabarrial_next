// src/app/(public)/clases/[slug]/page.tsx
import { getCollectionAdmin, getGlobalSettingsAdmin } from "@/services/admin-services";
import Contact from "@/components/sections/contact/Contact";
import DynamicSection from "@/components/DynamicSection/DynamicSection";
import { 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Music, 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle 
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { UniversalCardData } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- METADATA ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: classes } = await getCollectionAdmin("clases");
  const classItem = classes?.find((c: any) => c.slug === slug);

  if (!classItem) return { title: "Clase no encontrada" };

  return {
    title: `${classItem.name} | Escuela de Música Barrial`,
    description: classItem.description?.substring(0, 160),
    openGraph: {
      title: classItem.name,
      description: classItem.description?.substring(0, 160),
      url: `https://escuelademusicabarrial.ar/clases/${slug}`,
      images: [{ url: classItem.image_url || "/favicon.png" }],
    },
  };
}

// --- COMPONENTE PRINCIPAL ---
export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const [{ data: classes }, { data: settings }] = await Promise.all([
    getCollectionAdmin("clases"),
    getGlobalSettingsAdmin()
  ]);

  const allItems = (classes as any[]) || [];
  const classItem = allItems.find((c: any) => c.slug === slug && c.is_active);

  if (!classItem) {
    return (
      <div className="p-40 text-center font-black uppercase tracking-widest text-slate-300 text-xs">
        Clase no encontrada
      </div>
    );
  }

  const otherClassesData: UniversalCardData[] = allItems
    .filter((c: any) => c.slug !== slug && c.is_active)
    .map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.name,
      description: c.teacher_name,
      image_url: c.image_url, 
      color: "green",
      label: c.instrument || "Música",
    }));

  return (
    <article className="w-full bg-white">
      <nav className="w-full pt-12 pb-6 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/clases" className="flex items-center gap-3 text-slate-400 hover:text-green-600 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Volver a Clases</span>
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
                <Music size={14} strokeWidth={2.5} />
                <span>Formación Musical Activa</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-serif italic text-slate-900 leading-[0.95] mb-12 tracking-tight">
                {classItem.name}
              </h1>

              {/* FICHA TÉCNICA CORREGIDA: Sin truncate y con altura flexible */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 items-stretch">
                
                {/* Bloque: Docente */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 h-full">
                   <User size={20} className="text-green-600 shrink-0" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Docente</p>
                     <p className="text-sm font-bold text-slate-900 leading-snug">{classItem.teacher_name}</p>
                   </div>
                </div>

                {/* Bloque: Horario */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 h-full">
                   <Clock size={20} className="text-green-600 shrink-0" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Horarios</p>
                     <p className="text-sm font-bold text-slate-900 leading-snug">{classItem.schedule || "A coordinar"}</p>
                   </div>
                </div>

                {/* Bloque: Cupo */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 h-full">
                   <Users size={20} className="text-green-600 shrink-0" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cupos</p>
                     <p className="text-sm font-bold text-slate-900 leading-snug">
                        {classItem.max_capacity > 0 ? `${classItem.max_capacity} Vacantes` : "Consultar"}
                     </p>
                   </div>
                </div>

                {/* Bloque: Sede (Corregido para direcciones largas) */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 h-full">
                   <MapPin size={20} className="text-green-600 shrink-0" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sede</p>
                     <p className="text-sm font-bold text-slate-900 leading-snug">
                        {settings?.address || "Escuela Principal"}
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
                {classItem.description}
              </div>
            </div>
          </div>

          {/* IMAGEN STICKY */}
          {classItem.image_url && (
            <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-12">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] group">
                <Image 
                  src={classItem.image_url} 
                  alt={classItem.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  sizes="(max-w-768px) 100vw, 40vw" 
                  priority 
                />
                <div className="absolute top-8 left-8">
                   <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-xl flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Inscripción Abierta</span>
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </section>

      {otherClassesData.length > 0 && (
        <div className="bg-slate-50/50 border-t border-slate-100">
          <DynamicSection 
            title="Otras Clases" 
            description="Explora más disciplinas y encuentra la que mejor se adapte a vos." 
            items={otherClassesData} 
            layout="slider" 
            basePath="/clases" 
          />
        </div>
      )}

      <Contact 
        category="clases" 
        hasForm={true} 
        customTitle={`Sumate a ${classItem.name}`} 
        customDescription="Dejanos tus datos y te contactaremos para coordinar tu primera clase en la escuela."
      />
    </article>
  );
}