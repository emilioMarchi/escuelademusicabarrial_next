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
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  const tagColor = data.color && colors[data.color] ? colors[data.color] : colors.green;

  return (
    <Link href={`${basePath}/${data.slug}`} className="group block relative h-full w-full">
      <div className="relative h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
        
        <div className="relative w-full h-48 overflow-hidden bg-slate-100">
          {data.image_url ? (
            <Image src={data.image_url} alt={data.title || ""} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">EMB</div>
          )}
          {data.label && (
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${tagColor} shadow-sm`}>
              {data.label}
            </span>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-serif italic text-xl text-slate-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
            {data.title || data.name}
          </h3>

          {/* ESTA ES LA SECCIÓN QUE FALTABA EN TU CARD PARA VER LA DATA */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {data.date && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar size={13} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-tight">{data.date}</span>
              </div>
            )}
            {data.schedule && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock size={13} className="text-green-600" />
                <span className="text-[10px] font-bold uppercase tracking-tight">{data.schedule}</span>
              </div>
            )}
            {data.max_capacity && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users size={13} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Cupo: {data.max_capacity}</span>
              </div>
            )}
          </div>
          
          {!hideDescription && (data.description || data.excerpt) && (
            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2 italic">
              {data.description || data.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              {data.teacher_name ? (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <User size={10} className="text-green-600" /> {data.teacher_name}
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ver detalles</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-green-600 group-hover:text-white transition-all">
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}