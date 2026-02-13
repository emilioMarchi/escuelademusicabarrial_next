import Link from "next/link";
import Image from "next/image";
import { UniversalCardData } from "@/types";
import { ArrowUpRight, Clock, Calendar, Users, User } from "lucide-react";

interface Props {
  data: UniversalCardData;
  basePath: string;
  hideDescription?: boolean;
}

export default function CardItem({ data, basePath, hideDescription }: Props) {
  // 1. CONFIGURACIÓN DE COLORES DINÁMICOS
  // Mapeamos el color que viene de la data a las clases de Tailwind
  const themeStyles = {
    orange: {
      tag: "bg-orange-100 text-orange-700",
      titleHover: "group-hover:text-orange-600",
      icons: "text-orange-500",
      buttonHover: "group-hover:bg-orange-600",
    },
    green: {
      tag: "bg-green-100 text-green-700",
      titleHover: "group-hover:text-green-600",
      icons: "text-green-600",
      buttonHover: "group-hover:bg-green-600",
    },
    default: {
      tag: "bg-slate-100 text-slate-700",
      titleHover: "group-hover:text-slate-900",
      icons: "text-slate-400",
      buttonHover: "group-hover:bg-slate-900",
    }
  };

  // Seleccionamos el estilo actual (fallback a default si el color no existe)
  const colorKey = (data.color as keyof typeof themeStyles) || "default";
  const current = themeStyles[colorKey];

  return (
    <Link href={`${basePath}/${data.slug}`} className="group block relative h-full w-full">
      <div className="relative h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
        
        {/* IMAGEN Y ETIQUETA */}
        <div className="relative w-full h-48 overflow-hidden bg-slate-100">
          {data.image_url ? (
            <Image 
              src={data.image_url} 
              alt={data.title || ""} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">EMB</div>
          )}
          {data.label && (
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${current.tag} shadow-sm z-10`}>
              {data.label}
            </span>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className={`font-serif italic text-xl text-slate-900 mb-3 transition-colors line-clamp-2 ${current.titleHover}`}>
            {data.title || data.name}
          </h3>

          {/* FICHA TÉCNICA DINÁMICA */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {data.date && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar size={13} className={current.icons} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{data.date}</span>
              </div>
            )}
            {data.schedule && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock size={13} className={current.icons} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{data.schedule}</span>
              </div>
            )}
            {data.max_capacity && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users size={13} className={current.icons} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Cupo: {data.max_capacity}</span>
              </div>
            )}
          </div>
          
          {!hideDescription && (data.description || data.excerpt) && (
            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2 italic">
              {data.description || data.excerpt}
            </p>
          )}

          {/* FOOTER DE LA CARD */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              {data.teacher_name ? (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <User size={10} className={current.icons} /> {data.teacher_name}
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ver detalles</span>
              )}
            </div>
            
            {/* El botón circular también cambia de color al hacer hover en la card */}
            <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 transition-all ${current.buttonHover} group-hover:text-white`}>
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}