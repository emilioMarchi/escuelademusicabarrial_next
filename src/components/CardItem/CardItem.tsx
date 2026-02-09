// src/components/CardItem/CardItem.tsx
import Link from "next/link";
import Image from "next/image";
import { UniversalCardData } from "@/types";
import { ArrowUpRight } from "lucide-react";

interface Props {
  data: UniversalCardData; // Simplificado, ya incluye image_url
  basePath: string;
  hideDescription?: boolean;
}

export default function CardItem({ data, basePath, hideDescription }: Props) {
  // Tipamos el objeto de colores para que acepte las llaves de color
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  // Verificamos que el color exista en nuestro objeto, sino usamos green
  const tagColor = data.color && colors[data.color] ? colors[data.color] : colors.green;

  return (
    <Link href={`${basePath}/${data.slug}`} className="group block relative h-full w-full">
      <div className="relative h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2">
        
        <div className="relative w-full h-52 overflow-hidden bg-slate-50">
          {data.image_url ? (
            <Image 
              src={data.image_url} 
              alt={data.title || "Imagen"} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20 font-black">EMB</div>
          )}
          
          {data.label && (
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${tagColor} shadow-sm`}>
              {data.label}
            </span>
          )}
        </div>

        <div className="p-7 flex flex-col flex-grow">
          <h3 className="font-serif italic text-2xl text-slate-900 mb-3 group-hover:text-green-600 transition-colors">
            {data.title || data.name}
          </h3>
          
          {!hideDescription && (data.description || data.excerpt) && (
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2 italic">
              {data.description || data.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ver más</span>
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-green-600 group-hover:text-white transition-all">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}