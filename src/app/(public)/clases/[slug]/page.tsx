import { getCollectionAdmin } from "@/services/admin-services";
import Contact from "@/components/sections/contact/Contact";
import { User, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ClassDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: classes } = await getCollectionAdmin("clases");
  const classItem = classes?.find((c: any) => c.slug === slug);

  if (!classItem) return <div className="p-20 text-center uppercase tracking-widest font-bold text-slate-400">Clase no encontrada</div>;

  return (
    <div className="w-full bg-white">
      {/* HERO: Altura reducida y foto centrada */}
      <section className="relative w-full h-[45vh] bg-slate-900 overflow-hidden">
        {classItem.image_url && (
          <img 
            src={classItem.image_url} 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60" 
            alt={classItem.name} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent" />
        <div className="relative z-10 h-full w-full flex flex-col justify-end pb-12 px-6 md:px-16">
          <Link href="/clases" className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-all group w-fit">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase">
            {classItem.name}
          </h1>
        </div>
      </section>

      {/* DETALLES: Más compactos */}
      <section className="w-full bg-slate-50 py-6 px-6 md:px-16 border-b border-slate-200">
        <div className="flex flex-wrap gap-10">
          <div className="flex items-center gap-3">
            <User size={20} className="text-green-600"/>
            <div className="leading-tight">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Docente</p>
              <p className="text-base font-bold text-slate-800">{classItem.teacher_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-green-600"/>
            <div className="leading-tight">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Horarios</p>
              <p className="text-base font-bold text-slate-800">{classItem.schedule}</p>
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPCIÓN: Texto más legible y no tan gigante */}
      <section className="w-full py-16 px-6 md:px-16">
        <div className="max-w-4xl">
          <h2 className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em] mb-4">Sobre esta clase</h2>
          <div className="text-lg md:text-xl text-slate-600 leading-relaxed">
            {classItem.description}
          </div>
        </div>
      </section>

      {/* FORMULARIO: A lo ancho (max-w-6xl) y menos padding inferior */}
          <Contact 
            category="clases" 
            hasForm={true}
            customTitle={`Inscribite a ${classItem.name}`}
            customDescription="Completa el formulario para reservar tu lugar o realizar una consulta."
          />

    </div>
  );
}